import type {
  PulseOperation,
} from "../quantum/circuit";

import {
  averageFidelityWithErrors,
} from "../quantum/fidelity";


// 探索結果
export type SearchResult = {
  circuit: PulseOperation[];
  fidelity: number;
};


// 0 ～ 2π のランダムな角度を生成
function randomAngle(): number {
  return Math.random() * 2 * Math.PI;
}


// ランダムなパルス列を生成
export function randomCircuit(
  pulseCount: number
): PulseOperation[] {

  const circuit: PulseOperation[] = [];

  for (let i = 0; i < pulseCount; i++) {

    circuit.push({
      theta: randomAngle(),
      phi: randomAngle(),
    });

  }

  return circuit;
}


// 回路を ε・f の誤差込みで評価
export function evaluateCircuit(
  circuit: PulseOperation[]
): number {

  return averageFidelityWithErrors(
    circuit
  );
}