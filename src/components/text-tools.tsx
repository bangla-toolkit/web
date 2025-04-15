"use client";

import NerResults from "@bntk/components/ner-results";
import PosResults from "@bntk/components/pos-results";
import StemmingResults from "@bntk/components/stemming-results";
import TextInput from "@bntk/components/text-input";
import TokenizationResults from "@bntk/components/tokenization-results";
import TransliterationResults from "@bntk/components/transliteration-results";
import { Badge } from "@bntk/components/ui/badge";
import { Button } from "@bntk/components/ui/button";
import { Card, CardContent } from "@bntk/components/ui/card";
import { SampleTexts } from "@bntk/consts/sample-text";
import { stemWord } from "@bntk/stemming";
import { tokenizeToWords } from "@bntk/tokenization";
import { transliterate } from "@bntk/transliteration";
import {
  AlignJustify,
  Copy,
  GitBranchPlus,
  HelpCircle,
  Languages,
  RefreshCw,
  Sparkles,
  SplitSquareVertical,
  User,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@bntk/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@bntk/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@bntk/components/ui/tooltip";

const AVAILABLE_TABS = [
  "tokenization",
  "stemming",
  "ner",
  "pos",
  "transliteration",
];

export default function TextTools() {
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState("tokenization");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<any>(null);
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0 });

  const handleTextChange = (value: string) => {
    setText(value);
    setWordCount({
      words: value.trim() ? value.trim().split(/\s+/).length : 0,
      chars: value.length,
    });
    setResults(null);
  };

  const loadSampleText = () => {
    setText(SampleTexts[activeTab as keyof typeof SampleTexts] || "");
    const sampleText = SampleTexts[activeTab as keyof typeof SampleTexts] || "";
    setWordCount({
      words: sampleText.trim() ? sampleText.trim().split(/\s+/).length : 0,
      chars: sampleText.length,
    });
    setResults(null);
  };

  const analyzeText = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);

    try {
      let mockResults;

      switch (activeTab) {
        case "tokenization":
          mockResults = {
            tokens: tokenizeToWords(text),
          };
          break;
        case "stemming":
          mockResults = {
            stems: text
              .split(/\s+/)
              .filter((t) => t.length > 0)
              .map((word) => ({
                original: word,
                stem: stemWord(word),
              })),
          };
          break;
        case "ner":
          mockResults = {
            entities: [
              {
                text: "John Smith",
                type: "PERSON",
                start: text.indexOf("John Smith"),
              },
              {
                text: "Apple Inc.",
                type: "ORGANIZATION",
                start: text.indexOf("Apple Inc."),
              },
              {
                text: "New York City",
                type: "LOCATION",
                start: text.indexOf("New York City"),
              },
              { text: "Paris", type: "LOCATION", start: text.indexOf("Paris") },
            ],
          };
          break;
        case "pos":
          mockResults = {
            tags: text
              .split(/\s+/)
              .filter((t) => t.length > 0)
              .map((word) => {
                if (word.match(/^[A-Z]/)) return { word, tag: "NNP" };
                if (word.match(/ing$/)) return { word, tag: "VBG" };
                if (word.match(/s$/)) return { word, tag: "NNS" };
                if (word.match(/ed$/)) return { word, tag: "VBD" };
                if (word.match(/ly$/)) return { word, tag: "RB" };
                if (["the", "a", "an"].includes(word.toLowerCase()))
                  return { word, tag: "DT" };
                if (
                  ["over", "under", "in", "on", "at"].includes(
                    word.toLowerCase()
                  )
                )
                  return { word, tag: "IN" };
                return {
                  word,
                  tag: ["NN", "VB", "JJ"][Math.floor(Math.random() * 3)],
                };
              }),
          };
          break;
        case "transliteration":
          mockResults = {
            transliterated: transliterate(text),
          };
          break;
      }

      setResults(mockResults);
      setIsAnalyzing(false);
    } catch (error) {
      console.error("Error analyzing text: ", error);
      setIsAnalyzing(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setResults(null);
  };

  const renderResults = () => {
    if (!results) return null;

    switch (activeTab) {
      case "tokenization":
        return <TokenizationResults results={results} />;
      case "stemming":
        return <StemmingResults results={results} />;
      case "ner":
        return <NerResults results={results} text={text} />;
      case "pos":
        return <PosResults results={results} />;
      case "transliteration":
        return <TransliterationResults results={results} />;
      default:
        return null;
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "tokenization":
        return <SplitSquareVertical className="h-4 w-4 mr-1" />;
      case "stemming":
        return <GitBranchPlus className="h-4 w-4 mr-1" />;
      case "ner":
        return <User className="h-4 w-4 mr-1" />;
      case "pos":
        return <AlignJustify className="h-4 w-4 mr-1" />;
      case "transliteration":
        return <Languages className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getTabDescription = (tab: string) => {
    switch (tab) {
      case "tokenization":
        return "Breaks text into individual words or tokens.";
      case "stemming":
        return "Reduces words to their root or base form.";
      case "ner":
        return "Identifies and classifies named entities like people, organizations, and locations.";
      case "pos":
        return "Tags words with their part of speech (noun, verb, adjective, etc.).";
      case "transliteration":
        return "Converts English text to Bangla script.";
      default:
        return "";
    }
  };

  const copyToClipboard = () => {
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Text copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <TooltipProvider>
      <Card className="w-full max-w-4xl mx-auto p-0 shadow-xl border-slate-200 dark:border-slate-700 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Text Analysis Tools</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span className="sr-only">Help</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Advanced Text Analysis Tools</DialogTitle>
                    <DialogDescription>
                      Use these advanced tools to analyze your text in various
                      ways.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Available Tools:</h3>
                      <ul className="space-y-2">
                        {AVAILABLE_TABS.map((tab) => (
                          <li key={tab} className="flex items-start gap-2">
                            <div className="mt-0.5">{getTabIcon(tab)}</div>
                            <div>
                              <span className="font-medium capitalize">
                                {tab}
                              </span>
                              <p className="text-sm text-muted-foreground">
                                {getTabDescription(tab)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs
            defaultValue="tokenization"
            value={activeTab}
            onValueChange={handleTabChange}
            className="p-6"
          >
            <TabsList className="grid grid-cols-3 md:grid-cols-5 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {AVAILABLE_TABS.map((tab) => (
                <Tooltip key={tab}>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value={tab}
                      className="flex items-center justify-center transition-all duration-200 data-[state=active]:!bg-white dark:data-[state=active]:!bg-slate-700 data-[state=active]:shadow-md data-[state=active]:font-medium data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500"
                    >
                      {getTabIcon(tab)}
                      <span className="hidden sm:inline capitalize">{tab}</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getTabDescription(tab)}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TabsList>

            {AVAILABLE_TABS.map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium capitalize flex items-center">
                    {getTabIcon(tab)}
                    <span>{tab} Analysis</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadSampleText}
                          className="text-xs h-8"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sample Text
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Load a sample text for this tool</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <TextInput
                  value={text}
                  onChange={handleTextChange}
                  placeholder={`Enter text to ${
                    tab === "tokenization"
                      ? "tokenize"
                      : tab === "stemming"
                      ? "find word stems"
                      : tab === "ner"
                      ? "identify named entities"
                      : tab === "transliteration"
                      ? "transliterate"
                      : "analyze parts of speech"
                  }...`}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <Badge variant="outline" className="mr-2">
                      {wordCount.words}{" "}
                      {wordCount.words === 1 ? "word" : "words"}
                    </Badge>
                    <span>{wordCount.chars} characters</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyToClipboard}
                          disabled={!text.trim()}
                          className="h-9 w-9"
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy text</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy text to clipboard</p>
                      </TooltipContent>
                    </Tooltip>

                    <Button
                      onClick={analyzeText}
                      disabled={!text.trim() || isAnalyzing}
                      className="px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isAnalyzing ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Analyzing...
                        </span>
                      ) : (
                        `Analyze ${
                          tab === "tokenization"
                            ? "Tokens"
                            : tab === "stemming"
                            ? "Word Stems"
                            : tab === "ner"
                            ? "Named Entities"
                            : tab === "transliteration"
                            ? "Transliteration"
                            : "Parts of Speech"
                        }`
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}

            {renderResults()}
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
