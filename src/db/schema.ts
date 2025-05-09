export const schema = `
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS words_id_seq;

-- Table Definition
CREATE TABLE "public"."words" (
    "id" int4 NOT NULL DEFAULT nextval('words_id_seq'::regclass),
    "value" text NOT NULL,
    PRIMARY KEY ("id")
);

-- Table Definition
CREATE TABLE "public"."romanized_words" (
    "word_id" int4 NOT NULL,
    "value" text NOT NULL,
    CONSTRAINT "romanized_words_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "public"."words"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    PRIMARY KEY ("word_id")
);
`;
