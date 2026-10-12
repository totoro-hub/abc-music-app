export const INITIAL_ACTIVE_TUNE_ID: string = "tune-0";

export interface Tune {
  id: string;
  title: string;
  type: string;
  abcString: string;
}

export const INITIAL_TUNE_BOOK: Tune[] = [
  {
    id: "tune-0",
    title: "Scotland the Brave",
    type: "March",
    abcString: `X:1
T:Scotland the Brave
R: March
M: 4/4
K: Dmajor
%%graceslurs 0
%%bagpipes
|: e | {g}A2 {GdGe}A>B {gcd}c{e}A {gdc}ce | {ag}a2 {g}a2 {GdG}ae {gcd}c | {g}e{A}e {g}c{e}A |
{g}f2 {agb}f>f | {g}e{A}e {g}c{e}A | {g}B2 {GdG}B>c | {g}B{d}B {e}G{d}B |
{g}A2 {GdG}A>B | {g}c{e}c {g}c{e}c | {g}e2 {g}e>d | {g}e{A}e {g}c{e}A |
{g}f2 {agb}f>f | {g}e{A}e {g}c{e}A | {g}B2 {GdG}A>B | {g}A4 :|

|: {g}e2 {GdG}e>e | {g}e{A}e {g}c2 | {g}e2 {agb}f>e | {g}e{A}e {g}c2 |
{g}e2 {GdG}e>e | {g}f2 {g}e>f | {g}e{A}e d{e}c | {g}B{d}B {e}G{d}B |
{g}A2 {GdG}A>B | {g}c{e}c {g}c{e}c | {g}e2 {g}e>d | {g}e{A}e {g}c{e}A |
{g}f2 {agb}f>f | {g}e{A}e {g}c{e}A | {g}B2 {GdG}A>B | {g}A4 :|`,
  },
  {
    id: "tune-1",
    title: "The Maid Behind the Bar",
    type: "Reel",
    abcString: `X:1
T:The Maid Behind the Bar
R:reel
M:4/4
L:1/8
K:D
FAAB AFED|FAAB ABde|fBBA Bcde|fdBA BcdA|
FAAB AFED|FAAB ABde|fBBA Bcde|fdcB A2 d2:|
|:fddc d2 ag|fddc defg|eA A2 eA A2|eAAB cdeg|
fddc d2 ag|fddc defg|afge fdec|Addc d2 d2:|`,
  },
  {
    id: "tune-2",
    title: "The Blarney Pilgrim",
    type: "Jig",
    abcString: `X:2
T:The Blarney Pilgrim
R:jig
M:6/8
L:1/8
K:G
DED DEG|A2G ABc|BAG AGE|GED D3|
DED DEG|A2G ABc|BAG AGE|GED D3:|
|:d2d dBG|AGA BGE|d2d dBG|AGA G3|
d2d dBG|AGA BGE|B2G AGE|GED D3:|
|:A2D B2D|A2D ABc|BAG AGE|GED D3|
A2D B2D|A2D ABc|BAG AGE|GED D3:|`,
  },
];
