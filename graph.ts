import { Queue } from './queue';
export type vertex = number;
export type edge = [vertex,vertex];
type Q = Queue<vertex>;
const dummy : vertex = -1;

//simple undirected graph: no loops, no multiedges
//uses an adjacency table to represent the graph.
//Author: Dolev Artzi
export class Graph {
    private adjTable : Map<vertex,Set<vertex>>;
    private max_size : number;
    private verbose : boolean;


    private setMaxSize(n:number) {
        this.max_size = n > 2e4 ? 2e4 : n;
    }

    constructor(max_size : number = 20, verbose : boolean = false) {
        this.adjTable = new Map<vertex,Set<vertex>>();
        this.setMaxSize(max_size);
        this.verbose = verbose;
    }

    size() : number {
        if (this.verbose) console.log(`graph size: ${this.adjTable.size}`);
        return this.adjTable.size;
    }

    exists(v : vertex) : boolean {
        const neighbors = this.adjTable.get(v);
        const res = neighbors !== null && neighbors !== undefined;
        if (this.verbose) console.log(`vertex ${v} ${res ? 'exists' : 'does not exist'}`);
        return res;
    }

    existsEdge([v1,v2] : edge) {
        const v1_neighbors = this.adjTable.get(v1);
        const v2_neighbors = this.adjTable.get(v2);
        const res =  v1_neighbors?.has(v2) && v2_neighbors?.has(v1);
        if (this.verbose) console.log(`edge [${[v1,v2]}] ${res ? 'exists' : 'does not exist'}`);
        return res;
    }

    clear() {
        this.adjTable = new Map();
    }

    addVertex(v : vertex) : boolean {
        if (this.size() < this.max_size && !this.exists(v) && v !== dummy) {
            this.adjTable.set(v, new Set());
            if (this.verbose) console.log(`adding vertex ${v}`);
            return true;
        }
        if (this.verbose) console.log(`failed to add vertex ${v}`);

        return false;
    }

    //should only be called if v1 and v2 are in the graph
    private _addEdge([v1,v2]: edge) {
        this.adjTable.get(v1)?.add(v2);
        this.adjTable.get(v2)?.add(v1);
    }
    
    addEdge([v1,v2] : edge) : boolean {
        let added = false;
        if (v1 !== v2) {
            let toAdd = 0;
            let addV1 = false;
            let addV2 = true;
            if (!this.exists(v1)) { toAdd++; addV1 = true};
            if (!this.exists(v2)) { toAdd++; addV2 = true};
            if (toAdd === 0) {
                this._addEdge([v1,v2]);
                added = true;
            } else {
                if (this.size() + toAdd <= this.max_size) {
                    if (addV1) this.addVertex(v1);
                    if (addV2) this.addVertex(v2);
                    this._addEdge([v1,v2]);
                    added = true;
                }
            }
        }

        if (this.verbose) console.log(`${added ? 'added' : 'failed to add'} edge [${[v1,v2]}]`);
        return added;
    }

    removeVertex(v : vertex) : boolean {
        if (this.exists(v)) {
            if (this.verbose) console.log(`removing ${v}`);
            this.adjTable.forEach(neighborSet => {
                neighborSet.delete(v)
            });
            this.adjTable.delete(v);
            return true;
        } else {
            if (this.verbose) console.log(`failed to remove ${v}`);
            return false;
        }
    }

    neighbors(v1 : vertex) : Set<vertex> {
        if (!this.exists(v1)) return new Set();
        return this.adjTable.get(v1)!;
    }

    removeEdge([v1,v2] : edge) : boolean {
        if (this.existsEdge([v1,v2])) {
            if (this.verbose) console.log(`removing [${[v1,v2]}]`);
            const v1_neighbors = this.neighbors(v1);
            const v2_neighbors = this.neighbors(v2);
            v1_neighbors.delete(v2);
            v2_neighbors.delete(v1);
            return true;
        } else {
            if (this.verbose) console.log(`failed to remove [${[v1,v2]}]`);
            return false;
        }
    }

    bfsAll() {
        if (this.size() === 0) {
            return [];
        }

        //set up
        let visited = new Set();
        let parents = new Map<vertex,vertex>();
        const visit = (v : vertex) => visited.add(v);
        const set_parent = (v,p) => parents.set(v,p);
        let q : Q = new Queue();
        const vertices = Array.from(this.adjTable.keys());

        const bfsInner = (src:vertex) => {
            let ccEdges : edge[] = [];
            q.add(src);
            visited.add(src);
            parents.set(src,dummy);
    
            //traversal
            while (q.size() > 0) {
                let curr = q.remove();
                const neighbors = this.neighbors(curr);
                neighbors.forEach(w => {
                    if (!visited.has(w)) {
                        q.add(w);
                        set_parent(w,curr);
                        ccEdges.push([curr,w]);
                        visit(w);
                    }
                })
            }
            return ccEdges;
        }

        let edges : edge[][] = [];
        for (let i = 0; i < vertices.length; i++) {
            if (!visited.has(vertices[i])) {
                const edgesToAdd = bfsInner(vertices[i]);
                if (edgesToAdd.length > 0) edges.push(edgesToAdd);
            }
        }
        return edges;
    }

    bfs (src:vertex,dest:vertex) : [number[],boolean] {
        //set up
        let visited = new Set();
        let parents = new Map<vertex,vertex>();
        const visit = (v : vertex) => visited.add(v);
        const set_parent = (v,p) => parents.set(v,p);
        let q : Q = new Queue();
        q.add(src);
        visited.add(src);
        parents.set(src,dummy);
        let found = false;

        //traversal
        while (q.size() > 0) {
            let curr = q.remove();
            if (curr === dest) {
                found = true;
                break;
            }
    
            const neighbors = this.neighbors(curr);
            neighbors.forEach(w => {
                if (!visited.has(w)) {
                    q.add(w);
                    set_parent(w,curr);
                    visit(w);
                }
            })
        }

        //path reconstruction
        let path = [];
        if (found) {
            let curr_child = dest;
            path.push(dest);
            while (parents.get(curr_child) !== dummy) {
                path.push(parents.get(curr_child));
                curr_child = parents.get(curr_child);
            }
            path.reverse();
        }

        return [path,found];
    }

    print() {
        console.log(this.adjTable);
    }



    private includeFromProbability(p, random_outcome) {
        return p - random_outcome > 0;
      }
    
    
    randomGraph(vertex_probability:number, edge_probability:number,includeAllV = false) {
        if (includeAllV) vertex_probability = 1;
        this.adjTable = new Map();
        
        if (vertex_probability === 1) {
            for (let i = 0; i < this.max_size; i++) {
                this.addVertex(i);
            }
        } else {
            for (let i = 0; i < this.max_size; i++) {
                if (this.includeFromProbability(vertex_probability,Math.random())) {
                    this.addVertex(i);
                }
            }
        }    

        const curr_vertices = Array.from(this.adjTable.keys());

        for (let i = 0; i < curr_vertices.length; i++) {
            for (let j = i + 1; j < curr_vertices.length; j++) {
                if (this.includeFromProbability(edge_probability, Math.random())) {
                    this.addEdge([curr_vertices[i],curr_vertices[j]]);
                }
            }
            
        }
    }

    private ErdosReiniPrime(n:number,p:number) {
        this.clear();
        this.setMaxSize(n);
        this.randomGraph(1,p);
    }

    ErdosReini(n,f : number | ((x : number) => number)) {
        if (typeof f === 'number') {
            this.ErdosReiniPrime(n,f);
        } else {
            this.ErdosReini(n, f(n));
        }
    }

    Kn(n) {
        this.ErdosReini(n,1);
    }

    private f(...args) {
        console.log(...args);
    }

    private degreeCalc(f,b) {
        if (this.size() === 0) {
            return b;
        } 

        let acc = b; 

        const entries = Array.from(this.adjTable.entries());
        entries.forEach(v => {
            acc = f(acc,v[1].size);
        })

        return acc;
    }

    maxDegree() : number {
        return this.degreeCalc((x,y) => Math.max(x,y), 0);
    }

    totalEdges() : number {
        return this.totalDegree() / 2;
    }
    
    totalDegree() : number {
        return this.degreeCalc((x,y) => x+y,0);
    }

    averageDegree() : number {
        if (this.size() == 0) return 0;
        return this.totalDegree() / this.size();
    }

}