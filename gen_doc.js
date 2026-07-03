const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageNumber, Footer } = require("docx");

const ACCENT = "3B4CCA", LIGHT = "EEF0FF", CODEBG = "F2F3F8", GRAY = "666B85";
const CW = 9360;

const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const P  = (t, opts={}) => new Paragraph({ spacing: { after: 120 }, children: parseInline(t) });
const runs = (arr) => new Paragraph({ spacing: { after: 120 }, children: arr });
const bullet = (t) => new Paragraph({ numbering: { reference: "b", level: 0 }, spacing: { after: 60 }, children: parseInline(t) });
const num = (t) => new Paragraph({ numbering: { reference: "n", level: 0 }, spacing: { after: 60 }, children: parseInline(t) });

function parseInline(t){
  const parts = t.split("`"); const out=[];
  parts.forEach((p,i)=>{ if(!p) return;
    out.push(new TextRun(i%2 ? { text:p, font:"Courier New", size:20 } : { text:p, size:22 })); });
  return out;
}
function code(lines){
  return lines.map((ln,i)=> new Paragraph({
    spacing: { before: i===0?60:0, after: i===lines.length-1?120:0 },
    shading: { type: ShadingType.CLEAR, fill: CODEBG }, indent: { left: 120 },
    children: [new TextRun({ text: ln || " ", font: "Courier New", size: 19 })]
  }));
}
const border = { style: BorderStyle.SINGLE, size: 1, color: "D5D9EC" };
const borders = { top:border, bottom:border, left:border, right:border };
function cell(text, w, {head=false, mono=false, align=AlignmentType.LEFT}={}) {
  return new TableCell({ borders, width:{size:w,type:WidthType.DXA},
    shading:{ type:ShadingType.CLEAR, fill: head?ACCENT:"FFFFFF" },
    margins:{top:70,bottom:70,left:110,right:110},
    children:[ new Paragraph({ alignment:align, children:[
      new TextRun({ text:text, bold:head, color: head?"FFFFFF":"1E2440",
        font: mono?"Courier New":"Arial", size: mono?18:20 }) ] }) ] });
}
function table(widths, rows){
  return new Table({ width:{size:CW,type:WidthType.DXA}, columnWidths:widths,
    rows: rows.map((r,ri)=> new TableRow({ tableHeader: ri===0,
      children: r.map((c,ci)=> typeof c==="string"
        ? cell(c, widths[ci], { head: ri===0 })
        : cell(c.t, widths[ci], { head: ri===0, mono: c.mono, align: c.align }) ) })) });
}
const rule = () => new Paragraph({ border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:ACCENT, space:1 } }, spacing:{ after:120 } });
const callout = (title, body) => new Paragraph({
  shading:{ type:ShadingType.CLEAR, fill:LIGHT }, spacing:{ before:60, after:120 },
  border:{ left:{ style:BorderStyle.SINGLE, size:18, color:ACCENT, space:8 } }, indent:{ left:120 },
  children:[ new TextRun({ text:title+"  ", bold:true, color:"2E3A9E", size:21 }), new TextRun({ text:body, size:21 }) ] });

const children = [];

children.push(new Paragraph({ spacing:{after:40}, children:[ new TextRun({ text:"Build a Tiny JVM in C++", bold:true, size:44, color:ACCENT }) ]}));
children.push(new Paragraph({ spacing:{after:60}, children:[ new TextRun({ text:"An object-oriented Mini JVM — hands-on workshop", size:24, color:GRAY }) ]}));
children.push(rule());
children.push(P("In this lab you build a small model of the Java Virtual Machine out of C++ classes. Each class mirrors one part of the real JVM runtime — the Heap, the Method Area, the operand Stack, the PC Register, the Class Loader, and the Execution Engine. Then you run “bytecode” on it that actually creates objects on the heap, so the architecture comes alive instead of staying a diagram on a slide."));

children.push(H1("Learning Objectives"));
children.push(P("By the end of this workshop, students will be able to:"));
["Name the JVM runtime data areas and say what each one stores.",
 "Model each area as a C++ class with clear responsibilities.",
 "Implement the fetch–decode–execute loop of an interpreter.",
 "Trace how a `new` instruction cooperates with the Method Area and the Heap to build an object."].forEach(t=>children.push(bullet(t)));

children.push(H1("The Architecture You Are Building"));
children.push(P("Your `JVM` object owns the whole runtime area. Inside it, one C++ class stands in for each region of the JVM diagram:"));
children.push(table([2500,3200,3660], [
  ["C++ class","JVM part (from the diagram)","What it does"],
  [{t:"OperandStack",mono:true},"Stack Area (per-thread frame)","Holds the working values of a running method."],
  [{t:"PCRegister",mono:true},"PC Register","Tracks the address of the current instruction."],
  [{t:"Heap",mono:true},"Heap Area","Stores objects (instances) — “data about objects.”"],
  [{t:"MethodArea",mono:true},"Method Area","Stores loaded class metadata — “info about class.”"],
  [{t:"ClassLoader",mono:true},"Class Loaders","Loads classes into the Method Area."],
  [{t:"ExecutionEngine",mono:true},"Execution Engine","The interpreter: fetch–decode–execute."],
  [{t:"JVM",mono:true},"Runtime Area","Owns and wires all of the above together."],
]));
children.push(callout("Not implemented (on purpose):", "The Native Method Area and Java Native Interface handle native (C/assembly) code and most programs never touch them, so we leave them out — but the design has room to add them, exactly as the diagram shows."));

children.push(H1("The Instruction Set (our “bytecode”)"));
children.push(table([1550,1000,1500,5310], [
  ["Opcode","Value","Operand","Effect"],
  [{t:"HALT",mono:true},{t:"0",mono:true,align:AlignmentType.CENTER},{t:"—",align:AlignmentType.CENTER},"Stop the machine."],
  [{t:"PUSH",mono:true},{t:"1",mono:true,align:AlignmentType.CENTER},{t:"n",mono:true,align:AlignmentType.CENTER},"Push the integer n."],
  [{t:"ADD SUB MUL DIV",mono:true},{t:"2–5",mono:true,align:AlignmentType.CENTER},{t:"—",align:AlignmentType.CENTER},"Pop b, pop a, push a∘b (guard DIV by 0)."],
  [{t:"PRINT",mono:true},{t:"6",mono:true,align:AlignmentType.CENTER},{t:"—",align:AlignmentType.CENTER},"Pop the top value and print it."],
  [{t:"NEW",mono:true},{t:"7",mono:true,align:AlignmentType.CENTER},{t:"classId",mono:true,align:AlignmentType.CENTER},"Allocate an object of that class on the Heap; push its reference."],
  [{t:"STORE",mono:true},{t:"8",mono:true,align:AlignmentType.CENTER},{t:"fieldId",mono:true,align:AlignmentType.CENTER},"Pop value, pop ref; set the field; push the ref back."],
  [{t:"DESCRIBE",mono:true},{t:"9",mono:true,align:AlignmentType.CENTER},{t:"—",align:AlignmentType.CENTER},"Pop a ref; print ClassName{field=value, …}."],
]));

children.push(H1("Worked Example: building an object"));
children.push(runs([ new TextRun({ text:"Program A (after loading class Point with fields x, y): ", size:22 }),
  new TextRun({ text:"NEW 0, PUSH 3, STORE 0, PUSH 4, STORE 1, DESCRIBE, HALT", font:"Courier New", size:18 }) ]));
children.push(table([900,2100,6360], [
  ["Step","Instruction","What happens (Stack · Heap)"],
  [{t:"1",align:AlignmentType.CENTER},{t:"NEW 0",mono:true},"Method Area gives Point; Heap allocates it → ref#0. Stack [ref#0]"],
  [{t:"2",align:AlignmentType.CENTER},{t:"PUSH 3",mono:true},"Stack [ref#0, 3]"],
  [{t:"3",align:AlignmentType.CENTER},{t:"STORE 0",mono:true},"pop 3, pop ref#0, set x=3, push ref#0. Heap: Point{x=3}"],
  [{t:"4",align:AlignmentType.CENTER},{t:"PUSH 4",mono:true},"Stack [ref#0, 4]"],
  [{t:"5",align:AlignmentType.CENTER},{t:"STORE 1",mono:true},"set y=4. Heap: Point{x=3, y=4}"],
  [{t:"6",align:AlignmentType.CENTER},{t:"DESCRIBE",mono:true},"pop ref#0, print Point{x=3, y=4}. Stack [ ]"],
  [{t:"7",align:AlignmentType.CENTER},{t:"HALT",mono:true},"stop"],
]));
children.push(callout("Notice the cooperation:", "NEW and STORE both consult the Method Area (for the class and its field names) and mutate the Heap (the object). That hand-off between “info about class” and “data about objects” is the whole point of the diagram."));

children.push(H1("Session Timeline (about 50 minutes)"));
children.push(table([1700,7660], [
  ["Time","Activity"],
  [{t:"0–8 min",mono:true},"Tour the JVM diagram; map each area to the C++ class you will build."],
  [{t:"8–15 min",mono:true},"Read the starter; understand how JVM, ExecutionEngine, and the areas connect."],
  [{t:"15–40 min",mono:true},"Implement the TODOs: Heap.allocate, OperandStack push/pop, and the opcodes."],
  [{t:"40–47 min",mono:true},"Build and run; confirm Point{x=3, y=4} and 20."],
  [{t:"47–50 min",mono:true},"Debrief + stretch goals."],
]));

children.push(new Paragraph({ pageBreakBefore:true, heading:HeadingLevel.HEADING_1, children:[new TextRun("Your Task")]}));
children.push(P("Open `mini_vm_starter.cpp`. The class skeletons and the wiring are provided; fill in the marked TODOs. Work top to bottom:"));
[ "TODO 1 – `Heap::allocate`: create the object, return its index (the reference).",
  "TODO 2–3 – `OperandStack::push` / `pop`.",
  "TODO 4–8 – the arithmetic opcodes `ADD`, `SUB`, `MUL`, `DIV`, and `PRINT`.",
  "TODO 9 – `NEW`: look up the class in the Method Area, allocate on the Heap, push the ref.",
  "TODO 10 – `STORE`: set the field (name comes from the class metadata), push the ref back.",
  "TODO 11 – `DESCRIBE`: print `ClassName{field=value, …}`." ].forEach(t=>children.push(num(t)));

children.push(H2("A worked TODO to get you started"));
children.push(P("The `NEW` opcode shows how the areas cooperate:"));
children.push(...code([
  "case NEW: {",
  "    int classId = pc.fetch(code);",
  "    const ClassInfo& cls = methodArea.get(classId); // Method Area",
  "    int ref = heap.allocate(classId, cls.name);      // Heap",
  "    stack.push(ref);",
  "    break;",
  "}"
]));

children.push(H2("Build and run"));
children.push(...code([
  "g++ -std=c++17 -O2 -o minijvm mini_vm_starter.cpp",
  "./minijvm"
]));

children.push(H1("Expected Output"));
children.push(...code([
  "[ClassLoader] loaded class 'Point' into Method Area",
  "--- Program A: create an object ---",
  "[Heap] new Point  ->  ref#0",
  "[Heap] ref#0.x = 3",
  "[Heap] ref#0.y = 4",
  "[out] Point{x=3, y=4}",
  "Objects now in the Heap: 1",
  "",
  "--- Program B: (2 + 3) * 4 ---",
  "[out] 20"
]));

children.push(H1("Common Pitfalls"));
["Operand order for `SUB`/`DIV` — the value on top of the stack is `b`.",
 "`STORE` must push the reference back so the next `STORE` can find the object.",
 "Look the field name up from the class metadata (`cls.fieldNames[fieldId]`) — the Heap object only stores the values.",
 "Return the correct index from `Heap::allocate` (it is the object’s reference)."].forEach(t=>children.push(bullet(t)));

children.push(H1("Stretch Goals"));
["Add a second class (e.g., `Rectangle{w,h}`) and a program that builds one.",
 "Add `GETFIELD` to read a field back onto the stack, then use it in arithmetic.",
 "Add a `Frame` class and a real call stack so one method can `INVOKE` another — the JVM Stack Area holds one frame per call.",
 "Add a toy Garbage Collector: mark which heap references are still reachable from the stack, and report the rest."].forEach(t=>children.push(bullet(t)));

children.push(H1("The JVM Connection"));
children.push(table([3400,5960], [
  ["Your Mini JVM","In the real JVM"],
  [{t:"class Heap",mono:true},"The Heap — every object you `new` lives here"],
  [{t:"class MethodArea",mono:true},"The Method Area / Metaspace — loaded class info"],
  [{t:"class OperandStack",mono:true},"A frame’s operand stack in the Stack Area"],
  [{t:"class PCRegister",mono:true},"The per-thread PC register"],
  [{t:"class ClassLoader",mono:true},"The class loaders (Bootstrap / App / Extension)"],
  [{t:"class ExecutionEngine",mono:true},"The interpreter inside the Execution Engine"],
]));

children.push(rule());
children.push(H1("Facilitator Notes"));
["`mini_vm_solution.cpp` is the complete reference; it loads Point, builds it on the heap, prints `Point{x=3, y=4}`, then computes `20`.",
 "`mini-vm-workshop.html` is a live simulation of the JVM diagram: press Step and watch the Method Area gain a class, the Heap gain an object, the operand stack change, and the PC register advance.",
 "Only `g++` (or `clang++`) and the standard library are needed — everything is one file."].forEach(t=>children.push(bullet(t)));

const doc = new Document({
  styles: {
    default: { document: { run: { font:"Arial", size:22 } } },
    paragraphStyles: [
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:30, bold:true, font:"Arial", color:ACCENT },
        paragraph:{ spacing:{ before:260, after:140 }, outlineLevel:0 } },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal", quickFormat:true,
        run:{ size:25, bold:true, font:"Arial", color:"2E3A9E" },
        paragraph:{ spacing:{ before:160, after:100 }, outlineLevel:1 } },
    ]
  },
  numbering: { config: [
    { reference:"b", levels:[{ level:0, format:LevelFormat.BULLET, text:"•", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:520, hanging:260 } } } }] },
    { reference:"n", levels:[{ level:0, format:LevelFormat.DECIMAL, text:"%1.", alignment:AlignmentType.LEFT, style:{ paragraph:{ indent:{ left:520, hanging:260 } } } }] },
  ]},
  sections: [{
    properties: { page: { size:{ width:12240, height:15840 }, margin:{ top:1440, right:1440, bottom:1440, left:1440 } } },
    footers: { default: new Footer({ children:[ new Paragraph({ alignment:AlignmentType.CENTER, children:[
      new TextRun({ text:"Mini JVM Workshop   •   Page ", size:18, color:GRAY }),
      new TextRun({ children:[PageNumber.CURRENT], size:18, color:GRAY }) ]}) ] }) },
    children
  }]
});

Packer.toBuffer(doc).then(buf => { fs.writeFileSync("mini-vm-workshop-guide.docx", buf); console.log("wrote docx", buf.length); });
