import { Graph } from "./graph";


let G = new Graph(50,false);
// G.ErdosReini(100,.01);
// // G.Kn(101);
// console.log(G.totalEdges());
// // console.log(G.maxDegree());
// console.log(G.totalDegree());
// console.log(G.averageDegree());
// console.log(G.maxDegree());
// G.print();

function average(arr) {
    if (arr.length === 0) return 0;
    let tot = 0;
    for (let i = 0; i < arr.length; i++) tot += arr[i];
    return tot/arr.length;
}

function test(p,start:number,end:number,iter:number,f: (g:Graph) => any, step:number = 1) {
    let res = [];
    for (let i = start; i < end; i+= step) {
        let curr_res = [];
        for (let j = 0; j < iter; j++) {
            const G = new Graph(0);
            G.ErdosReini(i,p);
            // curr_res.push(f(G));
            curr_res.push(G.verticesOfDegreeD(Math.ceil(Math.sqrt(Math.log2(i)))));
        }
        res.push([i,curr_res,average(curr_res)]);
    }
    
    return res;
}

function extractAverages(p,start,end,iter,f,step = 1) {
    const res = test(p,start,end,iter,f,step);
    for (let i = 0; i < res.length; i++) {
        res[i] = [res[i][0], res[i][res[i].length - 1]];
    }
    console.log(res);
    return res;
}


// extractAverages((n) => Math.log(Math.log(n))/n,0,2000,15,g => g.maxDegree(),100);
extractAverages((n) => Math.min(1,10/n),0,1000,3,g => g.averageDegree(0),85);


