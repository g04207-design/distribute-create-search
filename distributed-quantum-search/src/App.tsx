import {
  useRef,
  useState,
} from "react";

import "./App.css";

import type {
  SearchResult,
} from "./search/randomSearch";


function App() {

  // ==============================
  // State
  // ==============================

  // 現在探索中かどうか
  const [isSearching, setIsSearching] =
    useState(false);

  // このPCで行った総評価回数
  const [evaluations, setEvaluations] =
    useState(0);

  // このPCで見つけた最高結果
  const [bestResult, setBestResult] =
    useState<SearchResult | null>(null);


  // ==============================
  // CPU情報
  // ==============================

  // ブラウザが報告する論理プロセッサ数
  const [cpuThreads] = useState(
    navigator.hardwareConcurrency || 1
  );

  // 論理プロセッサ数の半分をWorkerとして使用
  const workerCount = Math.max(
    1,
    Math.floor(cpuThreads / 2)
  );


  // ==============================
  // Worker
  // ==============================

  // 起動中のWorkerを保存する
  const workersRef =
    useRef<Worker[]>([]);


  // ==============================
  // サーバーへ結果を送る
  // ==============================

  const sendResultToServer = async (
    result: SearchResult
  ) => {

    try {

      const response = await fetch(
        "http://localhost:3001/result",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fidelity:
              result.fidelity,

            circuit:
              result.circuit,
          }),
        }
      );


      // 通信に失敗した場合
      if (!response.ok) {

        throw new Error(
          `Server error: ${response.status}`
        );
      }


      const data =
        await response.json();


      console.log(
        "Server response:",
        data
      );

    } catch (error) {

      console.error(
        "Failed to send result:",
        error
      );
    }
  };


  // ==============================
  // 探索開始
  // ==============================

  const startSearch = () => {

    // 以前のWorkerが残っていれば終了
    workersRef.current.forEach(
      (worker) => {
        worker.terminate();
      }
    );

    workersRef.current = [];


    // 表示を初期化
    setEvaluations(0);

    setBestResult(null);

    setIsSearching(true);


    // ------------------------------
    // Workerごとの探索回数
    // ------------------------------

    const workerEvaluations =
      new Array(workerCount).fill(0);


    // ------------------------------
    // このPC全体での最高結果
    // ------------------------------

    let localBest: SearchResult | null =
      null;


    // ------------------------------
    // 終了したWorker数
    // ------------------------------

    let finishedWorkers = 0;


    // ==============================
    // Workerを複数生成
    // ==============================

    for (
      let workerIndex = 0;
      workerIndex < workerCount;
      workerIndex++
    ) {

      const worker = new Worker(
        new URL(
          "./workers/searchWorker.ts",
          import.meta.url
        ),
        {
          type: "module",
        }
      );


      // Workerを保存
      workersRef.current.push(
        worker
      );


      // ============================
      // Workerからメッセージ受信
      // ============================

      worker.onmessage = (event) => {

        const data = event.data;


        // ==========================
        // 途中経過
        // ==========================

        if (
          data.type === "progress"
        ) {

          // このWorkerの探索回数を更新
          workerEvaluations[
            workerIndex
          ] = data.evaluations;


          // 全Workerの探索回数を合計
          const totalEvaluations =
            workerEvaluations.reduce(
              (
                sum,
                value
              ) => {
                return sum + value;
              },
              0
            );


          setEvaluations(
            totalEvaluations
          );


          // --------------------------
          // このPCの最高記録を更新
          // --------------------------

          if (
            localBest === null ||
            data.bestResult.fidelity >
              localBest.fidelity
          ) {

            localBest =
              data.bestResult;

            setBestResult(
              data.bestResult
            );
          }
        }


        // ==========================
        // Workerの探索終了
        // ==========================

        if (
          data.type === "finish"
        ) {

          // このWorkerの最終探索回数
          workerEvaluations[
            workerIndex
          ] = data.evaluations;


          // 全Workerの探索回数を合計
          const totalEvaluations =
            workerEvaluations.reduce(
              (
                sum,
                value
              ) => {
                return sum + value;
              },
              0
            );


          setEvaluations(
            totalEvaluations
          );


          // --------------------------
          // このPCの最高記録を更新
          // --------------------------

          if (
            localBest === null ||
            data.bestResult.fidelity >
              localBest.fidelity
          ) {

            localBest =
              data.bestResult;

            setBestResult(
              data.bestResult
            );
          }


          // ==========================
          // サーバーへ結果を送信
          // ==========================

          void sendResultToServer(
            data.bestResult
          );


          // 終了したWorkerをカウント
          finishedWorkers++;


          // ==========================
          // 全Workerが終了
          // ==========================

          if (
            finishedWorkers ===
            workerCount
          ) {

            setIsSearching(false);


            // 全Workerを終了
            workersRef.current.forEach(
              (worker) => {
                worker.terminate();
              }
            );


            workersRef.current = [];
          }
        }
      };


      // ============================
      // Workerでエラーが起きた場合
      // ============================

      worker.onerror = (error) => {

        console.error(
          "Worker error:",
          error
        );
      };


      // ============================
      // Workerへ探索命令を送る
      // ============================

      worker.postMessage({

        type: "start",

        // 1 Workerあたりの探索回数
        evaluations: 10000,

        // 複合パルスの数
        pulseCount: 5,

      });
    }
  };


  // ==============================
  // 探索停止
  // ==============================

  const stopSearch = () => {

    // すべてのWorkerを停止
    workersRef.current.forEach(
      (worker) => {
        worker.terminate();
      }
    );


    workersRef.current = [];


    setIsSearching(false);
  };


  // ==============================
  // 画面
  // ==============================

  return (

    <main>

      <h1>
        Distributed Quantum Search
      </h1>


      {/* 状態 */}

      <p>
        Status:{" "}

        {isSearching
          ? "Searching..."
          : "Stopped"}
      </p>


      {/* CPU情報 */}

      <p>
        Logical Processors:{" "}
        {cpuThreads}
      </p>


      <p>
        Workers Used:{" "}
        {workerCount}
      </p>


      {/* 探索回数 */}

      <p>
        Evaluations:{" "}

        {evaluations.toLocaleString()}
      </p>


      {/* 最高Fidelity */}

      <p>
        Best Fidelity:{" "}

        {bestResult
          ? `${(
              bestResult.fidelity *
              100
            ).toFixed(6)}%`
          : "---"}
      </p>


      {/* ==========================
          最高パルス列
          ========================== */}

      <h2>
        Best Pulse Sequence
      </h2>


      {bestResult ? (

        <ol>

          {bestResult.circuit.map(
            (
              operation,
              index
            ) => (

              <li key={index}>

                θ ={" "}

                {(
                  operation.theta /
                  Math.PI
                ).toFixed(4)}

                π


                {" , "}


                φ ={" "}

                {(
                  operation.phi /
                  Math.PI
                ).toFixed(4)}

                π

              </li>

            )
          )}

        </ol>

      ) : (

        <p>
          No result yet.
        </p>

      )}


      {/* ==========================
          操作ボタン
          ========================== */}

      <div>

        <button
          onClick={startSearch}
          disabled={isSearching}
        >

          Start Search

        </button>


        <button
          onClick={stopSearch}
          disabled={!isSearching}
        >

          Stop

        </button>

      </div>

    </main>
  );
}


export default App;