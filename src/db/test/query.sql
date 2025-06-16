Hurrah! We have somewhat good suggestions now. 


-- Input CTE (Using your example sentence)
WITH input_words (input_word, input_romanized) AS (
  VALUES
    ('আমি', 'ami'), ('তমাদের', 'tomader'), ('বাশায়', 'bashay'), ('জাব', 'jab'), ('কিন্তু', 'kintu'),
    ('জানিনা', 'janina'), ('কথায়', 'kothay'), ('তমার', 'tomar'), ('বাশা', 'basha'), ('টুমি', 'tumi'),
    ('কি', 'ki'), ('আমাকে', 'amake'), ('থিকানা', 'thikana'), ('দিতে', 'dite'), ('পারবে', 'parbe')
),

-- 1. Exact Match on Bangla Word
exact_bangla_match AS (
  SELECT
    iw.input_word,
    iw.input_romanized,
    w.value AS suggestion,
    'exact_bangla' AS match_type,
    1 AS match_priority, -- Highest priority
    1.0 AS score
  FROM input_words iw
  JOIN public.words w ON iw.input_word = w.value
),

-- 2. Exact Match on Romanized Word
exact_romanized_match AS (
  SELECT
    iw.input_word,
    iw.input_romanized,
    w.value AS suggestion,
    'exact_romanized' AS match_type,
    2 AS match_priority, -- Second priority
    1.0 AS score
  FROM input_words iw
  JOIN public.romanized_words rw ON iw.input_romanized = rw.value
  JOIN public.words w ON rw.word_id = w.id
  -- Prevent suggesting the same word if already found via exact Bangla match
  WHERE NOT EXISTS (
      SELECT 1 FROM exact_bangla_match ebm
      WHERE ebm.input_word = iw.input_word AND ebm.suggestion = w.value
  )
),

-- 3. Trigram Similarity Match on Romanized Word
trigram_romanized_match AS (
  SELECT
    iw.input_word,
    iw.input_romanized,
    w.value AS suggestion,
    'trigram_romanized' AS match_type,
    3 AS match_priority, -- Third priority
    similarity(iw.input_romanized, rw.value) AS score
    -- Optionally include distance: iw.input_romanized <-> rw.value as distance
  FROM input_words iw
  CROSS JOIN LATERAL (
     -- Select top candidates based on distance using the index
    SELECT rw_inner.word_id, rw_inner.value
    FROM public.romanized_words rw_inner
    -- Ensure some basic similarity exists (can leverage index)
    WHERE iw.input_romanized % rw_inner.value
    ORDER BY iw.input_romanized <-> rw_inner.value -- Order by distance (closer is better)
    LIMIT 15 -- Fetch more candidates initially to allow for filtering below
  ) AS rw
  JOIN public.words w ON rw.word_id = w.id
  WHERE
    -- Filter by a minimum similarity score (tune this threshold)
    similarity(iw.input_romanized, rw.value) > 0.3
    -- Filter 1: Don't suggest the *exact* input word back via trigram
    AND w.value != iw.input_word
    -- Filter 2: Exclude suggestions already found via exact matches
    AND NOT EXISTS (
        SELECT 1 FROM exact_bangla_match ebm
        WHERE ebm.input_word = iw.input_word AND ebm.suggestion = w.value
    )
    AND NOT EXISTS (
        SELECT 1 FROM exact_romanized_match erm
        WHERE erm.input_word = iw.input_word AND erm.suggestion = w.value
    )
),

-- Combine ALL potential matches (including exact matches of potentially misspelled words)
all_matches AS (
  SELECT input_word, input_romanized, suggestion, match_type, match_priority, score FROM exact_bangla_match
  UNION ALL
  SELECT input_word, input_romanized, suggestion, match_type, match_priority, score FROM exact_romanized_match
  UNION ALL
  SELECT input_word, input_romanized, suggestion, match_type, match_priority, score FROM trigram_romanized_match
),

-- Rank all combined matches for each input word
ranked_matches AS (
  SELECT
    input_word,
    input_romanized,
    suggestion,
    match_type,
    match_priority,
    score,
    ROW_NUMBER() OVER (
      PARTITION BY input_word
      ORDER BY
        match_priority ASC, -- 1. Priority level (exact > romanized_exact > trigram)
        score DESC,         -- 2. Similarity/Exactness score (higher is better)
        suggestion ASC      -- 3. Deterministic tie-breaking
    ) as rn
  FROM all_matches
)

-- Final Output: Select up to 5 top-ranked suggestions/matches for each input word.
SELECT
  rm.input_word,
  rm.input_romanized,
  rm.suggestion,
  rm.match_type,
  rm.score,
  rm.rn as suggestion_rank -- The rank (1 to 5) of this suggestion for the input word
FROM ranked_matches rm
WHERE rm.rn <= 5 -- Limit to the top 5 results per input word
ORDER BY rm.input_word, rm.rn; -- Order results clearly
 