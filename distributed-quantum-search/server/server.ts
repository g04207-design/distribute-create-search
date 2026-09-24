import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3001;


// 1つのパルス
type PulseOperation = {
  theta: number;
  phi: number;
};


// 探索結果
type SearchResult = {
  fidelity: number;
  circuit: PulseOperation[];
};


// 現在の全体ベスト
let globalBest: SearchResult = {
  fidelity: -Infinity,
  circuit: [],
};


// サーバーが動いているか確認
app.get("/", (_req, res) => {
  res.json({
    message: "Distributed Quantum Search Server",
  });
});


// クライアントから探索結果を受け取る
app.post("/result", (req, res) => {

  const {
    fidelity,
    circuit,
  } = req.body;


  if (
    typeof fidelity !== "number" ||
    !Array.isArray(circuit)
  ) {
    return res.status(400).json({
      error: "Invalid result",
    });
  }


  // 今までより良い結果なら更新
  if (
    fidelity > globalBest.fidelity
  ) {

    globalBest = {
      fidelity,
      circuit,
    };

    console.log(
      "New Global Best:",
      fidelity
    );
  }


  res.json({
    success: true,
    globalBest,
  });
});


// 現在の最高結果を取得
app.get("/best", (_req, res) => {

  res.json(globalBest);

});


app.listen(PORT, () => {

  console.log(
    `Server running on http://localhost:${PORT}`
  );

});