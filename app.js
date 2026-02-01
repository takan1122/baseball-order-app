const manualAssignments = {
  投手: "佐藤",
  捕手: null,
  一塁: "鈴木",
  二塁: null,
  遊撃: null,
  三塁: null,
  左翼: null,
  中堅: null,
  右翼: null,
};

const members = [
  {
    name: "佐藤",
    positions: {
      投手: true, 捕手: false, 一塁: false,
      二塁: false, 遊撃: false, 三塁: false,
      左翼: false, 中堅: false, 右翼: false,
    }
  },
  {
    name: "鈴木",
    positions: {
      投手: false, 捕手: true, 一塁: true,
      二塁: false, 遊撃: false, 三塁: false,
      左翼: false, 中堅: false, 右翼: false,
    }
  },
  {
    name: "高橋",
    positions: {
      投手: false, 捕手: true, 一塁: false,
      二塁: true, 遊撃: true, 三塁: false,
      左翼: false, 中堅: false, 右翼: false,
    }
  },
  {
    name: "田中",
    positions: {
      投手: false, 捕手: false, 一塁: false,
      二塁: true, 遊撃: false, 三塁: true,
      左翼: true, 中堅: true, 右翼: true,
    }
  }
];
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
    const candidates = remainingMembers.filter(
      m => m.positions[position] === true
    );

    if (candidates.length === 0) {
      return { ok: false, reason: `${position} を守れる人がいません` };
    }

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
const emptyPositions = getEmptyPositions(manualAssignments);
const availableMembers = getUnusedMembers(manualAssignments, members);
const result = autoAssign(emptyPositions, availableMembers);

if (!result.ok) {
  console.error(result.reason);
} else {
  const finalAssignments = {
    ...manualAssignments,
    ...result.assignments
  };
  const dhMembers = result.remainingMembers.map(m => m.name);

  console.log("最終守備:", finalAssignments);
  console.log("DH候補:", dhMembers);
}
