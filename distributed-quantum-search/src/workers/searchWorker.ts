import {
  randomCircuit,
  evaluateCircuit,
} from "../search/randomSearch";

import type {
  SearchResult,
} from "../search/randomSearch";


// メイン画面から受け取るデータ
type StartMessage = {
  type: "start";
  evaluations: number;
  pulseCount: number;
};


// Workerから画面へ送る途中経過
type ProgressMessage = {
  type: "progress";
  evaluations: number;
  bestResult: SearchResult;
};


// Workerから画面へ送る最終結果
type FinishMessage = {
  type: "finish";
  evaluations: number;
  bestResult: SearchResult;
};


self.onmessage = (
  event: MessageEvent<StartMessage>
) => {

  const {
    evaluations,
    pulseCount,
  } = event.data;

  let bestResult: SearchResult = {
    circuit: [],
    fidelity: -Infinity,
  };


  for (
    let i = 1;
    i <= evaluations;
    i++
  ) {

    // θ・φをランダムに持つ
    // パルス列を生成
    const circuit =
      randomCircuit(pulseCount);


    // ε・fを考慮した
    // 平均Fidelityを計算
    const fidelity =
      evaluateCircuit(circuit);


    // 今までより良ければ更新
    if (
      fidelity >
      bestResult.fidelity
    ) {

      bestResult = {
        circuit,
        fidelity,
      };
    }


    // 1000回ごとに途中経過を送る
    if (i % 1000 === 0) {

      const message: ProgressMessage = {
        type: "progress",
        evaluations: i,
        bestResult,
      };

      self.postMessage(message);
    }
  }


  // 探索終了
  const message: FinishMessage = {
    type: "finish",
    evaluations,
    bestResult,
  };

  self.postMessage(message);
};