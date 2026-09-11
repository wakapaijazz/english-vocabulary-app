export type InflectionKind = "base" | "third-person" | "past" | "past-participle" | "progressive";

const irregularThirdPerson: Record<string, string> = {
  be: "is",
  do: "does",
  go: "goes",
  have: "has",
};

const irregularPast: Record<string, string> = {
  arise: "arose",
  be: "was",
  become: "became",
  begin: "began",
  break: "broke",
  bring: "brought",
  build: "built",
  buy: "bought",
  catch: "caught",
  choose: "chose",
  come: "came",
  cost: "cost",
  cut: "cut",
  do: "did",
  draw: "drew",
  drink: "drank",
  drive: "drove",
  eat: "ate",
  fall: "fell",
  feel: "felt",
  fight: "fought",
  find: "found",
  fly: "flew",
  forget: "forgot",
  get: "got",
  give: "gave",
  go: "went",
  grow: "grew",
  have: "had",
  hear: "heard",
  hold: "held",
  keep: "kept",
  know: "knew",
  leave: "left",
  lend: "lent",
  let: "let",
  lie: "lay",
  lose: "lost",
  make: "made",
  mean: "meant",
  meet: "met",
  pay: "paid",
  put: "put",
  read: "read",
  ride: "rode",
  ring: "rang",
  rise: "rose",
  run: "ran",
  say: "said",
  see: "saw",
  sell: "sold",
  seek: "sought",
  send: "sent",
  set: "set",
  shake: "shook",
  shine: "shone",
  shoot: "shot",
  show: "showed",
  shut: "shut",
  sing: "sang",
  sit: "sat",
  sleep: "slept",
  speak: "spoke",
  spend: "spent",
  stand: "stood",
  steal: "stole",
  strive: "strove",
  swim: "swam",
  take: "took",
  teach: "taught",
  tear: "tore",
  tell: "told",
  think: "thought",
  throw: "threw",
  understand: "understood",
  uphold: "upheld",
  wake: "woke",
  wear: "wore",
  win: "won",
  withdraw: "withdrew",
  withstand: "withstood",
  write: "wrote",
};

const irregularPastParticiple: Record<string, string> = {
  arise: "arisen",
  be: "been",
  become: "become",
  begin: "begun",
  break: "broken",
  bring: "brought",
  build: "built",
  buy: "bought",
  catch: "caught",
  choose: "chosen",
  come: "come",
  cost: "cost",
  cut: "cut",
  do: "done",
  draw: "drawn",
  drink: "drunk",
  drive: "driven",
  eat: "eaten",
  fall: "fallen",
  feel: "felt",
  fight: "fought",
  find: "found",
  fly: "flown",
  forget: "forgotten",
  get: "gotten",
  give: "given",
  go: "gone",
  grow: "grown",
  have: "had",
  hear: "heard",
  hold: "held",
  keep: "kept",
  know: "known",
  leave: "left",
  lend: "lent",
  let: "let",
  lie: "lain",
  lose: "lost",
  make: "made",
  mean: "meant",
  meet: "met",
  pay: "paid",
  put: "put",
  read: "read",
  ride: "ridden",
  ring: "rung",
  rise: "risen",
  run: "run",
  say: "said",
  see: "seen",
  sell: "sold",
  seek: "sought",
  send: "sent",
  set: "set",
  shake: "shaken",
  shine: "shone",
  shoot: "shot",
  show: "shown",
  shut: "shut",
  sing: "sung",
  sit: "sat",
  sleep: "slept",
  speak: "spoken",
  spend: "spent",
  stand: "stood",
  steal: "stolen",
  strive: "striven",
  swim: "swum",
  take: "taken",
  teach: "taught",
  tear: "torn",
  tell: "told",
  think: "thought",
  throw: "thrown",
  understand: "understood",
  uphold: "upheld",
  wake: "woken",
  wear: "worn",
  win: "won",
  withdraw: "withdrawn",
  withstand: "withstood",
  write: "written",
};

const irregularProgressive: Record<string, string> = {
  be: "being",
  die: "dying",
  lie: "lying",
  see: "seeing",
  tie: "tying",
};

const doubledPast: Record<string, string> = {
  admit: "admitted",
  compel: "compelled",
  commit: "committed",
  concur: "concurred",
  confer: "conferred",
  control: "controlled",
  infer: "inferred",
  occur: "occurred",
  omit: "omitted",
  permit: "permitted",
  prefer: "preferred",
  propel: "propelled",
  refer: "referred",
  submit: "submitted",
};

const doubledProgressive: Record<string, string> = {
  admit: "admitting",
  begin: "beginning",
  commit: "committing",
  control: "controlling",
  occur: "occurring",
  get: "getting",
  run: "running",
  sit: "sitting",
  swim: "swimming",
  win: "winning",
  permit: "permitting",
  prefer: "preferring",
  refer: "referring",
  submit: "submitting",
};

function isConsonantY(lemma: string): boolean {
  return /[^aeiou]y$/i.test(lemma);
}

function isShortCvc(lemma: string): boolean {
  const shortDoublingVerbs = new Set(["beg", "chat", "clap", "drop", "fit", "grab", "hug", "jog", "nod", "plan", "rob", "rub", "skip", "slip", "shop", "step", "stop", "tap"]);
  return shortDoublingVerbs.has(lemma.toLowerCase());
}

export function inflectThirdPerson(lemma: string): string {
  const lower = lemma.toLowerCase();
  if (irregularThirdPerson[lower]) return irregularThirdPerson[lower];
  if (isConsonantY(lower)) return `${lower.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh|o)$/i.test(lower)) return `${lower}es`;
  return `${lower}s`;
}

export function inflectPast(lemma: string): string {
  const lower = lemma.toLowerCase();
  if (irregularPast[lower]) return irregularPast[lower];
  if (doubledPast[lower]) return doubledPast[lower];
  if (lower.endsWith("e")) return `${lower}d`;
  if (isConsonantY(lower)) return `${lower.slice(0, -1)}ied`;
  if (isShortCvc(lower)) return `${lower}${lower.slice(-1)}ed`;
  return `${lower}ed`;
}

export function inflectPastParticiple(lemma: string): string {
  const lower = lemma.toLowerCase();
  return irregularPastParticiple[lower] ?? inflectPast(lower);
}

export function inflectProgressive(lemma: string): string {
  const lower = lemma.toLowerCase();
  if (irregularProgressive[lower]) return irregularProgressive[lower];
  if (doubledProgressive[lower]) return doubledProgressive[lower];
  if (lower.endsWith("ie")) return `${lower.slice(0, -2)}ying`;
  if (lower.endsWith("e") && !/(ee|oe|ye)$/i.test(lower)) return `${lower.slice(0, -1)}ing`;
  if (isShortCvc(lower)) return `${lower}${lower.slice(-1)}ing`;
  return `${lower}ing`;
}

export function getInflectionKind(lemma: string, targetForm: string): InflectionKind {
  const lowerLemma = lemma.toLowerCase();
  const lowerTarget = targetForm.toLowerCase();
  if (lowerTarget === lowerLemma) return "base";
  if (lowerTarget === inflectThirdPerson(lowerLemma)) return "third-person";
  if (lowerTarget === inflectPastParticiple(lowerLemma)) return "past-participle";
  if (lowerTarget === inflectPast(lowerLemma) || Object.values(irregularPast).includes(lowerTarget)) return "past";
  if (lowerTarget === inflectProgressive(lowerLemma)) return "progressive";
  if (/ing$/i.test(lowerTarget)) return "progressive";
  if (/(en|n)$/i.test(lowerTarget)) return "past-participle";
  if (/(ied|ed|d)$/i.test(lowerTarget)) return "past";
  if (/(ies|es|s)$/i.test(lowerTarget)) return "third-person";
  return "base";
}

export function inflectLike(lemma: string, targetLemma: string, targetForm: string): string {
  switch (getInflectionKind(targetLemma, targetForm)) {
    case "third-person": return inflectThirdPerson(lemma);
    case "past": return inflectPast(lemma);
    case "past-participle": return inflectPastParticiple(lemma);
    case "progressive": return inflectProgressive(lemma);
    default: return lemma.toLowerCase();
  }
}

export function getInflectionCandidates(lemma: string): string[] {
  const candidates = [lemma, inflectPast(lemma), inflectPastParticiple(lemma), inflectThirdPerson(lemma), inflectProgressive(lemma)];
  return [...new Set(candidates)];
}
