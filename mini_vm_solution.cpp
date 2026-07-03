// =====================================================================
//  Mini JVM  —  REFERENCE SOLUTION (facilitator copy)
//
//  An object-oriented model of the JVM runtime, built from C++ classes
//  that mirror the real architecture:
//
//     JVM  (the Runtime Area)
//      ├── MethodArea      "info about class"      (loaded class metadata)
//      ├── Heap            "data about objects"    (instances live here)
//      ├── ClassLoader     loads classes into the Method Area
//      └── ExecutionEngine the interpreter: fetch-decode-execute, using
//                          an OperandStack + a PCRegister per run.
//
//  The bytecode can create real objects (NEW / STORE / DESCRIBE), so the
//  Heap and Method Area come alive.
//
//  Build:  g++ -std=c++17 -O2 -o minijvm mini_vm_solution.cpp
//  Run:    ./minijvm
// =====================================================================
#include <iostream>
#include <vector>
#include <map>
#include <string>
using namespace std;

// ---- The instruction set (our "bytecode") ---------------------------
enum Op {
    HALT=0, PUSH=1, ADD=2, SUB=3, MUL=4, DIV=5, PRINT=6,
    NEW=7,       // NEW <classId>    : allocate an object, push its reference
    STORE=8,     // STORE <fieldId>  : pop value, pop ref, set field, push ref
    DESCRIBE=9   // DESCRIBE          : pop ref, print the object
};

// =====================================================================
//  METHOD AREA  —  "info about class"
// =====================================================================
struct ClassInfo {
    string name;
    vector<string> fieldNames;      // e.g. {"x","y"} for a Point
};
class MethodArea {
    map<int, ClassInfo> classes;    // classId -> metadata
public:
    void define(int id, const ClassInfo& c) { classes[id] = c; }
    const ClassInfo& get(int id)            { return classes.at(id); }
};

// =====================================================================
//  HEAP  —  "data about objects"
// =====================================================================
struct ObjectData {
    int classId;
    string className;
    map<string,int> fields;
};
class Heap {
    vector<ObjectData> objects;
public:
    int allocate(int classId, const string& name) {
        objects.push_back(ObjectData{classId, name, {}});
        return (int)objects.size() - 1;      // the object's "reference"
    }
    ObjectData& get(int ref) { return objects.at(ref); }
    int count() const        { return (int)objects.size(); }
};

// =====================================================================
//  OPERAND STACK  —  the working stack of a thread's frame (Stack Area)
// =====================================================================
class OperandStack {
    vector<int> data;
public:
    void push(int v) { data.push_back(v); }
    int  pop()       { int v = data.back(); data.pop_back(); return v; }
    bool empty() const { return data.empty(); }
    int  size()  const { return (int)data.size(); }
};

// =====================================================================
//  PC REGISTER  —  "address of current instruction"
// =====================================================================
class PCRegister {
    size_t pc = 0;
public:
    size_t get() const                 { return pc; }
    void   set(size_t v)               { pc = v; }
    int    fetch(const vector<int>& c) { return c[pc++]; }   // read & advance
    bool   atEnd(const vector<int>& c) const { return pc >= c.size(); }
};

// =====================================================================
//  CLASS LOADER  —  loads classes into the Method Area
// =====================================================================
class ClassLoader {
    MethodArea& methodArea;
public:
    ClassLoader(MethodArea& ma) : methodArea(ma) {}
    void load(int id, const string& name, const vector<string>& fields) {
        methodArea.define(id, ClassInfo{name, fields});
        cout << "[ClassLoader] loaded class '" << name << "' into Method Area\n";
    }
};

// =====================================================================
//  EXECUTION ENGINE  —  the interpreter (fetch-decode-execute)
// =====================================================================
class ExecutionEngine {
    Heap& heap;
    MethodArea& methodArea;
public:
    ExecutionEngine(Heap& h, MethodArea& ma) : heap(h), methodArea(ma) {}

    void run(const vector<int>& code) {
        OperandStack stack;   // this run's operand stack
        PCRegister   pc;      // this run's PC register

        while (!pc.atEnd(code)) {
            int op = pc.fetch(code);          // FETCH
            switch (op) {                     // DECODE + EXECUTE
                case PUSH:  stack.push(pc.fetch(code)); break;
                case ADD: { int b=stack.pop(), a=stack.pop(); stack.push(a+b); break; }
                case SUB: { int b=stack.pop(), a=stack.pop(); stack.push(a-b); break; }
                case MUL: { int b=stack.pop(), a=stack.pop(); stack.push(a*b); break; }
                case DIV: { int b=stack.pop(), a=stack.pop();
                            if (b==0){ cerr<<"[error] divide by zero\n"; return; }
                            stack.push(a/b); break; }
                case PRINT: cout << "[out] " << stack.pop() << "\n"; break;

                case NEW: {
                    int classId = pc.fetch(code);
                    const ClassInfo& cls = methodArea.get(classId);   // Method Area
                    int ref = heap.allocate(classId, cls.name);       // Heap
                    stack.push(ref);
                    cout << "[Heap] new " << cls.name << "  ->  ref#" << ref << "\n";
                    break;
                }
                case STORE: {
                    int fieldId = pc.fetch(code);
                    int value   = stack.pop();
                    int ref     = stack.pop();
                    ObjectData& obj = heap.get(ref);
                    const ClassInfo& cls = methodArea.get(obj.classId); // Method Area
                    const string& field  = cls.fieldNames.at(fieldId);
                    obj.fields[field] = value;
                    stack.push(ref);                                    // leave ref for chaining
                    cout << "[Heap] ref#" << ref << "." << field << " = " << value << "\n";
                    break;
                }
                case DESCRIBE: {
                    int ref = stack.pop();
                    ObjectData& obj = heap.get(ref);
                    const ClassInfo& cls = methodArea.get(obj.classId);
                    cout << "[out] " << obj.className << "{";
                    for (size_t i=0; i<cls.fieldNames.size(); ++i) {
                        const string& f = cls.fieldNames[i];
                        cout << (i? ", ":"") << f << "=" << obj.fields[f];
                    }
                    cout << "}\n";
                    break;
                }
                case HALT: return;
                default: cerr << "[error] unknown opcode " << op << "\n"; return;
            }
        }
    }
};

// =====================================================================
//  JVM  —  the Runtime Area that owns everything
// =====================================================================
class JVM {
    MethodArea      methodArea;                 // "info about class"
    Heap            heap;                        // "data about objects"
    ClassLoader     loader{methodArea};          // Class Loaders
    ExecutionEngine engine{heap, methodArea};    // Execution Engine
public:
    ClassLoader& classLoader() { return loader; }
    Heap&        theHeap()     { return heap; }
    void execute(const vector<int>& code) { engine.run(code); }
};

int main() {
    JVM jvm;

    // 1) Load a class into the Method Area (like the JVM loading a .class)
    jvm.classLoader().load(/*id=*/0, "Point", {"x", "y"});

    // 2) Bytecode that BUILDS an object:  new Point; p.x=3; p.y=4; describe
    vector<int> objProgram = {
        NEW, 0,        // new Point            -> ref on stack
        PUSH, 3, STORE, 0,   // p.x = 3
        PUSH, 4, STORE, 1,   // p.y = 4
        DESCRIBE,      // print  Point{x=3, y=4}
        HALT
    };
    cout << "--- Program A: create an object ---\n";
    jvm.execute(objProgram);
    cout << "Objects now in the Heap: " << jvm.theHeap().count() << "\n\n";

    // 3) Pure arithmetic still works:  (2 + 3) * 4
    vector<int> calc = { PUSH,2, PUSH,3, ADD, PUSH,4, MUL, PRINT, HALT };
    cout << "--- Program B: (2 + 3) * 4 ---\n";
    jvm.execute(calc);

    return 0;
}
