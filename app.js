const APP_TITLE = "草野球オーダー決定アプリ（試作）";
const APP_VERSION = "v0.7.6";

const DEFENSE_POSITIONS = [
  "投手",
  "捕手",
  "一塁",
  "二塁",
  "三塁",
  "遊撃",
  "左翼",
  "中堅",
  "右翼",
];

const state = {
  screen: "top", // 現在の画面

  members: [],           // CSVから読み込んだ全メンバー
  activeMembers: [],     // 今日の出場者（memberオブジェクト配列）

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
    DH: null,
  },

  result: null,          // 自動決定結果
};

const screenHistory = [];

function renderMemberSelection() {
  const container = document.getElementById("memberCheckboxes");
  container.innerHTML = "";

  state.members.forEach(member => {
    const label = document.createElement("label");
    label.style.display = "block";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        if (!state.activeMembers.includes(member)) {
          state.activeMembers.push(member);
        }
      } else {
        state.activeMembers = state.activeMembers.filter(
          m => m !== member
        );
      }
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + member.name));
    container.appendChild(label);
  });

  // 初期状態：全員出場
  state.activeMembers = [...state.members];
}

function renderManualAssignments() {
  const tbody = document.getElementById("manualTable");
  tbody.innerHTML = "";

  const positions = Object.keys(state.manualAssignments);

  positions.forEach(position => {
    const tr = document.createElement("tr");

    // 守備名
    const tdPos = document.createElement("td");
    tdPos.textContent = position;

    // 手入力
    const tdInput = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "空欄＝自動";
    input.value = state.manualAssignments[position] ?? "";

    input.oninput = () => {
      const v = input.value.trim();
      state.manualAssignments[position] = v === "" ? null : v;
    };
    tdInput.appendChild(input);

    // プルダウン
    const tdSelect = document.createElement("td");
    const select = document.createElement("select");

    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = "—";
    select.appendChild(empty);

    state.activeMembers.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.name;
      opt.textContent = m.name;
      select.appendChild(opt);
    });

    select.onchange = () => {
      if (select.value) {
        input.value = select.value;
        state.manualAssignments[position] = select.value;
        select.value = "";
      }
    };

    tdSelect.appendChild(select);

    tr.appendChild(tdPos);
    tr.appendChild(tdInput);
    tr.appendChild(tdSelect);
    tbody.appendChild(tr);
  });
}

function goTo(screen) {
  screenHistory.push(state.screen);
  state.screen = screen;
  render();
}

function goBack() {
  const prevScreen = screenHistory.pop();
  if (!prevScreen) return;

  state.screen = prevScreen;
  render();
}

function render() {
  document.querySelectorAll(".screen").forEach(el => {
    el.classList.add("hidden");
  });

  document
    .getElementById(`screen-${state.screen}`)
    .classList.remove("hidden");

  switch (state.screen) {
    case "members":
      renderMemberSelection();
      break;
    case "manual":
      renderManualAssignments();
      break;
    case "result":
      if (state.result) {
        renderResult(state.result.assignments, state.result.dh);
      }
      break;
  }
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
    tdName.textContent = name != null ? name : "—";

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

    console.log("assign", position);
    console.log(
      "candidates:",
      candidates.map(m => m.name)
    );
    console.log("selected:", selected.name);

    assignments[position] = selected.name;
    remainingMembers = remainingMembers.filter(
      m => m.name !== selected.name
    );

    console.log(
      "remaining after",
      position,
      remainingMembers.map(m => m.name)
    );
  }

  console.log(
    "final remaining:",
    remainingMembers.map(m => ({
      name: m.name,
      DH: m.positions.DH
    }))
  );

  return { ok: true, assignments, remainingMembers };
}

function runAssignment() {
  console.log("=== runAssignment ===");
  console.log("manualAssignments:", state.manualAssignments);
  const emptyPositions = DEFENSE_POSITIONS.filter(
    pos => state.manualAssignments[pos] == null
  );
  const defenseAssignments = {};
    DEFENSE_POSITIONS.forEach(pos => {
    defenseAssignments[pos] = state.manualAssignments[pos];
  });

  const availableMembers =
    getUnusedMembers(defenseAssignments, state.activeMembers);
  console.log("activeMembers:", state.activeMembers.map(m => m.name));

  console.log(
    "[before assign]",
    availableMembers.map(m => ({ name: m.name, DH: m.positions?.DH }))
  );

  // レアポジション優先
  emptyPositions.sort((a, b) => {
    const countA = availableMembers.filter(
      m => m.positions[a] !== "ng"
    ).length;
    const countB = availableMembers.filter(
      m => m.positions[b] !== "ng"
    ).length;
    return countA - countB;
  });

  const result = autoAssign(emptyPositions, availableMembers);

  if (!result.ok) {
    alert(result.reason);
    return false;
  }

  const finalAssignments = {
    ...state.manualAssignments,
    ...result.assignments
  };

  const assignedDefenseNames = new Set(
    DEFENSE_POSITIONS
      .map(pos => finalAssignments[pos])
      .filter(Boolean)
  );
  
  const check = checkDefenseComplete(finalAssignments);
  if (!check.ok) {
    alert(check.message);
    return false;
  }

  const assignedDefenseNames = new Set(
    DEFENSE_POSITIONS
      .map(pos => finalAssignments[pos])
      .filter(Boolean)
  );

  const dhMembers = state.manualAssignments.DH
    ? [state.manualAssignments.DH]
    : state.activeMembers
        .filter(m =>
          !assignedDefenseNames.has(m.name) &&
          m.positions.DH !== "ng"
        )
        .map(m => m.name);
  
  state.result = {
    assignments: finalAssignments,
    dh: dhMembers
  };
  goTo("result");
  console.log(
    "remaining:",
    result.remainingMembers.map(m => ({
      name: m.name,
      DH: m.positions.DH
    }))
  );
  console.log(
    "[after assign]",
    state.members.map(m => ({ name: m.name, DH: m.positions?.DH }))
  );
  return true;
}

function checkDefenseComplete(assignments) {
  const unassigned = Object.entries(assignments)
    .filter(([_, name]) => name == null || name === "")
    .map(([pos]) => pos);

  if (unassigned.length > 0) {
    return {
      ok: false,
      message: "守備位置が成立しません。\n未割当: " + unassigned.join("、")
    };
  }
  return { ok: true };
}

function csvToMembers(csv) {
  const lines = csv.trim().split("\n").map(l => l.split(","));
  const headers = lines.shift();

  function conv(v) {
    if (!v) return "ng";
    const s = v.trim();   // ← これが本体
    if (s === "希望") return "hope";
    if (s === "可能") return "ok";
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

document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("DOMContentLoaded start");

    // CSV読み込み
    const csvText = await loadSheetCSV();
    state.members = csvToMembers(csvText);
    state.activeMembers = [...state.members];

  } catch (e) {
    console.error("初期化失敗", e);

    // フォールバック（最低限動かす）
    state.members = [];
    state.activeMembers = [];
  }

  console.log(
    "[after csv load]",
    state.members.map(m => ({ name: m.name, DH: m.positions?.DH }))
  );

  // 戻るボタン
  document.querySelectorAll(".backBtn").forEach(btn => {
    btn.addEventListener("click", goBack);
  });

  // **追加：画面遷移用ボタン**
  document.getElementById("startBtn").addEventListener("click", () => {
    console.log("開始ボタン押された");
    goTo("members");
  });

  document.getElementById("toManualBtn").addEventListener("click", () => {
    console.log("次へボタン押された");
    if (state.activeMembers.length < 9) {
      alert("出場者が9人未満です。守備が成立しません。");
      return;
    }
    goTo("manual");
  });

  document.getElementById("toResultBtn").addEventListener("click", () => {
    console.log("自動決定ボタン押された");
    runAssignment();
  });

  // 初期描画
  render();
});
