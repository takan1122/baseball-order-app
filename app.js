const APP_TITLE = "草野球オーダー決定アプリ（試作）";
const APP_VERSION = "v0.3.0";

const state = {
  screen: "top", // 現在の画面

  members: [],           // CSVから読み込んだ全メンバー
  activeMembers: [],     // 今日の出場者（名前配列）

  manualAssignments: {   // 守備固定
    投手: null,
    捕手: null,
    一塁: null,
    二塁: null,
    三塁: null,
    遊撃: null,
    左翼: null,
    中堅: null,
    右翼: null,
  },

  result: null,          // 自動決定結果
};

function goTo(screen) {
  state.screen = screen;
  render();
}

function renderResult(assignments, dhMembers) {
  const tableBody = document.getElementById("defenseTable");
  const dhList = document.getElementById("dhList");

  // 初期化
  tableBody.innerHTML = "";
  dhList.innerHTML = "";

  // 守備表
  for (const [position, name] of Object.entries(assignments)) {
    const tr = document.createElement("tr");

    const tdPosition = document.createElement("td");
    tdPosition.textContent = position;

    const tdName = document.createElement("td");
    tdName.textContent = name ?? "—";

    tr.appendChild(tdPosition);
    tr.appendChild(tdName);
    tableBody.appendChild(tr);
  }

  // DH候補
  if (dhMembers.length === 0) {
    const li = document.createElement("li");
    li.textContent = "なし";
    dhList.appendChild(li);
  } else {
    dhMembers.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      dhList.appendChild(li);
    });
  }
}

function pickRandom(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}
function getEmptyPositions(manualAssignments) {
  return Object.keys(manualAssignments)
    .filter(position => manualAssignments[position] == null);
}

function getUnusedMembers(manualAssignments, members) {
  const usedNames = new Set(
    Object.values(manualAssignments).filter(Boolean)
  );
  return members.filter(m => !usedNames.has(m.name));
}
function autoAssign(emptyPositions, availableMembers) {
  const assignments = {};
  let remainingMembers = [...availableMembers];

  for (const position of emptyPositions) {

    // ① 希望者
    let candidates = remainingMembers.filter(
      m => m.positions[position] === "hope"
    );

    // ② 希望がいなければ可能
    if (candidates.length === 0) {
      candidates = remainingMembers.filter(
        m => m.positions[position] === "ok"
      );
    }

    // ③ それでもいなければ失敗
    if (candidates.length === 0) {
      return { ok: false, reason: `${position} を守れる人がいません` };
    }

    // ④ 抽選
    const selected = candidates.length === 1
      ? candidates[0]
      : pickRandom(candidates);

    assignments[position] = selected.name;
    remainingMembers = remainingMembers.filter(
      m => m.name !== selected.name
    );
  }

  return { ok: true, assignments, remainingMembers };
}

function runAssignment() {
  const emptyPositions = getEmptyPositions(manualAssignments);
  const availableMembers = getUnusedMembers(manualAssignments, members);

  // レアポジション優先
  emptyPositions.sort((a, b) => {
    const countA = availableMembers.filter(m => m.positions[a]).length;
    const countB = availableMembers.filter(m => m.positions[b]).length;
    return countA - countB;
  });

  const result = autoAssign(emptyPositions, availableMembers);

  if (!result.ok) {
    alert(result.reason);
    return false;
  }

  const finalAssignments = {
    ...manualAssignments,
    ...result.assignments
  };

  const dhMembers = result.remainingMembers.map(m => m.name);

  renderResult(finalAssignments, dhMembers);
  return true;
}

function csvToMembers(csv) {
  const lines = csv.trim().split("\n").map(l => l.split(","));
  const headers = lines.shift();

  function conv(v) {
    if (v === "希望") return "hope";
    if (v === "可能") return "ok";
    return "ng";
  }

  return lines.map(row => {
    const r = {};
    headers.forEach((h, i) => r[h] = row[i]);

    return {
      name: r["名前"],
      positions: {
        投手: conv(r["投手"]),
        捕手: conv(r["捕手"]),
        一塁: conv(r["一塁"]),
        二塁: conv(r["二塁"]),
        三塁: conv(r["三塁"]),
        遊撃: conv(r["遊撃"]),
        左翼: conv(r["左翼"]),
        中堅: conv(r["中堅"]),
        右翼: conv(r["右翼"]),
        DH:   conv(r["DH"])
      }
    };
  });
}

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT3sgmk9NHOJA3Nk6j_4V-8NBMt8VdHqZupreWNoL4xET8f03FhLPSv6zq-PyTPwnRTb1Tz8PzNNAXW/pub?gid=0&single=true&output=csv";

async function loadSheetCSV() {
  const res = await fetch(SHEET_CSV_URL);
  return await res.text();
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("loadMembersBtn");

  if (!button) {
    console.error("loadMembersBtn が見つかりません");
    return;
  }

  button.addEventListener("click", async () => {
    const csv = await loadSheetCSV();
    members = csvToMembers(csv);

    console.log("読み込んだメンバー:", members);

    runAssignment(); // ← ここはもう関数化してあるのでこれでOK
  });
});
