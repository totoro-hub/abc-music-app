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
C: Traditional
R: March
M: 4/4
K: HK
%%graceslurs 0
%%bagpipes
 e [| {g}A2 {GdGe}A>B {gcd}c{e}A {gdc}ce | {ag}a2 {g}a2 {GdG}ae {gcd}c{e}A | {Gdc}d2 {g}f>d {gcd}c2 {gef}e>c | {gBd}B2 {gef}e2 {A}e>f {g}e>d{g}c>B |
{g}A2 {GdGe}A>B {gcd}c{e}A {gdc}ce | {ag}a2 {g}a2 {GdG}ae {gcd}c{e}A | {Gdc}d2 {g}f>d {gcd}ce {gcd}c{e}A | {GdG}B2 {g}A>B {G}A2 {gcd}ce |]
[| {ag}a2 {g}a2 {GdG}ae {gcd}c{e}A | {ag}a2 {g}a2 {GdG}ae {gcd}ce | {Gdc}d2 {g}f>d {gcd}c2 {gef}e>c | {gBd}B2 {gef}e2 {A}e>f {g}e>d{g}c>B |
{g}A2 {GdGe}A>B {gcd}c{e}A {gdc}ce | {ag}a2 {g}a2 {GdG}ae {gcd}c{e}A | {Gdc}d2 {g}f>d {gcd}ce {gcd}c{e}A | {GdG}B2 {g}A>B {G}A2> |]`,
  },
  {
    id: "tune-1",
    title: "The Rowan Tree",
    type: "March",
    abcString: `X:1
T:The Rowan Tree
C: Traditional
R:March
M:4/4
K:HK
%%graceslurs 0
%%bagpipes
{g}A>B [| {GdG}c2> {GdG}c2 {gcd}c2 {e}B2 | {g}c e2> {A}e4 a2 | {gfg}f2> e2 {g}f2 a2 | {gfg}f2 e {A}e2 {g}A>B |
 {GdG}c2> {GdG}c2 {gcd}c2 {e}B2 | {g}c e2> {gfg}f4> e2 | {gef}e2 c2 {gBd}B2> {G}A2 | {g}A4 {GAG}A |]
{g}e [| {A}e2> a2 {g}a2> g2 | {f}g2 f2 {gfg}f2 {ag}a2 | {ef}e2> f2 {gfg}fe {Gdc}dc | {gcd}c4 {gBd}B2 {g}A>B |
 {GdG}c2> {GdG}c2 {gcd}c2 {e}B2 | {g}c e2> {gfg}f4> e2 | {gef}e2 c2 {gBd}B2> {G}A2 | {g}A4 {GAG}A2 |]`,
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
