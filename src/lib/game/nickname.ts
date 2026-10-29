// Keep this small, deterministic policy shared by the browser and Edge Function.
const blocked = /fuck|fuk|fuc|shit|shyt|bitch|biatch|cunt|nigg|n1gg|fagg|kike|chink|paki|tranny|retard|whore|slut|porn|penis|pussy|cock|dick|wank|nazi|hitler|heilhitler|rape|rapist|pedophile|paedophile|pedo|paedo|cumshot|blowjob|handjob|motherf|bastard|asshole|arsehole/;
const wholeWord = /^(ass|arse|tit|tits|cum|sex|xxx)$/;
export function nicknameError(value: string): string | null {
  const name = value.trim();
  if (!/^[A-Za-z0-9 _-]{2,16}$/.test(name) || !/[A-Za-z0-9]/.test(name)) return "Use 2–16 letters, numbers, spaces, underscores or hyphens.";
  const normalise = (s: string) => s.toLowerCase().replace(/[01345789]/g, c => ({ "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "9": "g" })[c]!).replace(/(.)\1+/g, "$1");
  // Compare both original and repeated-letter forms; separators cannot hide a word.
  const compact = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const decoded = name.toLowerCase().replace(/[01345789]/g, c => ({ "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "9": "g" })[c]!).replace(/[^a-z]/g, "");
  if (/^(scunthorpe|cockburn|dickson|dickinson|hancock|peacock)$/.test(compact)) return null;
  if ([compact, decoded, normalise(compact)].some(s => blocked.test(s) || wholeWord.test(s)) || name.split(/[ _-]+/).some(s => wholeWord.test(normalise(s)))) return "Please choose a different player name. Keep it friendly.";
  return null;
}
