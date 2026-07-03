// =====================================================================
//  Mini JVM  —  STARTER  (fill in the TODOs)
//
//  You are building an OBJECT-ORIENTED model of the JVM runtime. Each
//  C++ class mirrors a real part of the JVM (see the architecture diagram):
//
//     JVM  (the Runtime Area)
//      ├── MethodArea      "info about class"      (given)
//      ├── Heap            "data about objects"    (you finish allocate)
//      ├── OperandStack    a frame's working stack (you finish push/pop)
//      ├── PCRegister      "address of current instruction"  (given)
//      ├── ClassLoader     loads classes            (given)
//      └── ExecutionEngine the interpreter loop     (you finish the opcodes)
//
//  Build:  g++ -std=c++17 -O2 -o minijvm mini_vm_starter.cpp
//  Run:    ./minijvm
//  Goal:   Program A prints  Point{x=3, y=4}  and Program B prints  20.
// =====================================================================
#include <iostream>
#include <vector>
#include <map>
#include <string>
using namespace std;

enum Op {
    HALT=0, PUSH=1, ADD=2, SUB=3, MUL=4, DIV=5, PRINT=6,
    NEW=7,       // NEW <classId>    : allocate an object, push its reference
    STORE=8,     // STORE <fieldId>  : pop value, pop ref, set field, push ref back
    DESCRIBE=9   // DESCRIBE          : pop ref, print the object
};

// ============ METHOD AREA — "info about class" (GIVEN) ===============
struct ClassInfo { string name; vector<string> fieldNames; };
class MethodArea {
    map<int, ClassInfo> classes;
public:
    void define(int id, const ClassInfo& c) { classes[id] = c; }
    const ClassInfo& get(int id)            { return classes.at(id); }
};

// ============ HEAP — "data about objects" ============================
struct ObjectData { int classId; string className; map<string,int> fields; };
class Heap {
    vector<ObjectData> objects;
public:
    int allocate(int classId, const string& name) {
        // TODO 1: push a new ObjectData{classId, name, {}} onto `objects`
        //         and RETURN its index (that index is the object's reference).
        return -1;   // <-- replace this
    }
    ObjectData& get(int ref) { return objects.at(ref); }
    int count() const        { return (int)objects.size(); }
};

// ============ OPERAND STACK — a frame's working stack ================
class OperandStack {
    vector<int> data;
public:
    void push(int v) {
        // TODO 2: push v onto `data`.
    }
    int pop() {
        // TODO 3: read the top of `data`, remove it, and return it.
        return 0;    // <-- replace this
    }
    bool empty() const { return data.empty(); }
    int  size()  const { return (int)data.size(); }
};

// ============ PC REGISTER — "address of current instruction" (GIVEN)==
class PCRegister {
    size_t pc = 0;
public:
    size_t get() const                 { return pc; }
    void   set(size_t v)               { pc = v; }
    int    fetch(const vector<int>& c) { return c[pc++]; }   // read & advance
    bool   atEnd(const vector<int>& c) const { return pc >= c.size(); }
};

// ============ CLASS LOADER (GIVEN) ==================================
class ClassLoader {
    MethodArea& methodArea;
public:
    ClassLoader(MethodArea& ma) : methodArea(ma) {}
    void load(int id, const string& name, const vector<string>& fields) {
        methodArea.define(id, ClassInfo{name, fields});
        cout << "[ClassLoader] loaded class '" << name << "' into Method Area\n";
    }
};

// ============ EXECUTION ENGINE — the interpreter ====================
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
                case PUSH: stack.push(pc.fetch(code)); break;   // (example, done)

                case ADD: {
                    // TODO 4: pop b, pop a, push a + b
                    break;
                }
                case SUB: {
                    // TODO 5: push a - b  (b is the top of the stack)
                    break;
                }
                case MUL: {
                    // TODO 6: push a * b
                    break;
                }
                case DIV: {
                    // TODO 7: push a / b, guarding against b == 0
                    break;
                }
                case PRINT: {
                    // TODO 8: pop the top value and print:  cout << "[out] " << v << "\n";
                    break;
                }

                case NEW: {
                    // TODO 9: read classId = pc.fetch(code);
                    //         look up the class in the Method Area;
                    //         allocate it on the Heap; push the returned reference.
                    //   Hint: const ClassInfo& cls = methodArea.get(classId);
                    //         int ref = heap.allocate(classId, cls.name);
                    //         stack.push(ref);
                    break;
                }
                case STORE: {
                    // TODO 10: read fieldId; pop value; pop ref;
                    //          look up the field name from the class metadata;
                    //          set obj.fields[field] = value; push ref back.
                    //   Hint: ObjectData& obj = heap.get(ref);
                    //         const ClassInfo& cls = methodArea.get(obj.classId);
                    //         const string& field  = cls.fieldNames.at(fieldId);
                    break;
                }
                case DESCRIBE: {
                    // TODO 11: pop ref; print  ClassName{field=value, ...}
                    //          iterate cls.fieldNames in order.
                    break;
                }

                case HALT: return;
                default: cerr << "[error] unknown opcode " << op << "\n"; return;
            }
        }
    }
};

// ============ JVM — the Runtime Area that owns everything (GIVEN) ====
class JVM {
    MethodArea      methodArea;
    Heap            heap;
    ClassLoader     loader{methodArea};
    ExecutionEngine engine{heap, methodArea};
public:
    ClassLoader& classLoader() { return loader; }
    Heap&        theHeap()     { return heap; }
    void execute(const vector<int>& code) { engine.run(code); }
};

int main() {
    JVM jvm;
    jvm.classLoader().load(0, "Point", {"x", "y"});

    vector<int> objProgram = {
        NEW, 0,              // new Point
        PUSH, 3, STORE, 0,   // p.x = 3
        PUSH, 4, STORE, 1,   // p.y = 4
        DESCRIBE,            // -> Point{x=3, y=4}
        HALT
    };
    cout << "--- Program A: create an object ---\n";
    jvm.execute(objProgram);
    cout << "Objects now in the Heap: " << jvm.theHeap().count() << "\n\n";

    vector<int> calc = { PUSH,2, PUSH,3, ADD, PUSH,4, MUL, PRINT, HALT };
    cout << "--- Program B: (2 + 3) * 4 ---\n";
    jvm.execute(calc);
    return 0;
}
