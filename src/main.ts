import * as EsportApi from "./lol-esports-api.ts";

// const yo = await EsportApi.getSchedule();

// response.data.schedule.events.forEach((event) => console.log(event));

// console.log(await EsportApi.getLiveDraft());

type Team = {
  prioScore: number; // Prioscore from https://gol.gg/champion/list/season-S15/split-Summer/tournament-ALL/
  synergy: number; // synergy bonus with rest of comp (0 to 1)
  countered: number; // counter penalty from opponent (0 to 1)
}[];

function predictWinProbability(
  teamA: Team,
  teamB: Team,
  weights = { prioScore: 1.0, synergy: 0.5, conter: 0.7 },
) {
  function draftScore(team: Team) {
    return team.reduce((sum, champ) => {
      return sum +
        (weights.prioScore * champ.prioScore) +
        (weights.synergy * champ.synergy) -
        (weights.conter * champ.countered);
    }, 0);
  }

  const scoreA = draftScore(teamA);
  const scoreB = draftScore(teamB);

  // Logistic function to map score difference to win probability
  const diff = scoreA - scoreB;
  const probabilityA = 1 / (1 + Math.exp(-diff));

  return probabilityA;
}

const teamA = [
  { prioScore: 0.85, synergy: 0, countered: 0.4 },
  { prioScore: 0.83, synergy: 0, countered: 1 },
  { prioScore: 0.71, synergy: 0, countered: 1 },
  { prioScore: 0.61, synergy: 0, countered: 1 },
  { prioScore: 0.59, synergy: 0, countered: 1 },
];

const teamB = [
  { prioScore: 0.3, synergy: 0, countered: 0 },
  { prioScore: 0.3, synergy: 0, countered: 0 },
  { prioScore: 0.3, synergy: 0, countered: 0 },
  { prioScore: 0.3, synergy: 0, countered: 0 },
  { prioScore: 0.3, synergy: 0, countered: 0 },
];

// console.log(
//   "Team A win probability:",
//   predictWinProbability(teamA, teamB),
// );
