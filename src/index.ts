const v8 = require('v8');

function structuredClone(obj: Record<string, string>): Record<string, string> {
    return v8.deserialize(v8.serialize(obj)) as Record<string, string>;
};

// import crossProduct from "./crossproduct";
// console.log(crossProduct(['1', '2', '3', '4', '5', '6', '7', '8', '9'], ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']).length);
function cross(A: string[], B: string[]): string[] {
    let result: string[] = []
    for (const a of A) {
        for (const b of B) {
            result.push(a + b);
        }
    }
    return result
}
function flatten<T>(collection: T[][]): T[] {
    let result: T[] = []
    for (const row of collection) {
        for (const item of row) {
            result.push(item)
        }
    }
    return result
}
function zip<S1, S2>(firstCollection: Array<S1>, lastCollection: Array<S2>): Array<[S1, S2]> {
    const length = Math.min(firstCollection.length, lastCollection.length);
    const zipped: Array<[S1, S2]> = [];
    for (let index = 0; index < length; index++) {
        zipped.push([firstCollection[index], lastCollection[index]]);
    }
    return zipped;
}
function removeItem(arr: string[], value: string): string[] {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}
function removeItemAll(arr: string[], value: string): string[] {
    var i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}
function assign(values: Record<string, string>, s: string, d: string): boolean | Record<string, string> {
    let other_values: string = ""
    try {
        other_values = values[s].replace(d, '')
        //console.log(other_values + " " + s + " " + d)
    } catch {
        //console.log(s + " " + values[s] + " " + d)
        return false
    }
    for (const d2 of other_values) {
        //console.log("eli " + d2 + " from " + s + "'s peers")
        if (!eliminate(values, s, d2)) {
            return false
        }
    }
    return values
}
function eliminate(values: Record<string, string>, s: string, d2: string): boolean {
    // remove d2 from values[s] possible value
    if (values[s].indexOf(d2) == -1) {
        return true
    }
    values[s] = values[s].replace(d2, '')
    // if values[s] have no possible value
    if (values[s].length == 0) {
        return false
    }
    // if values[s] have 1 possible value, eliminate that value from its peers
    else if (values[s].length == 1) {
        let d3 = values[s]
        for (const p of peers[s]) {
            if (!eliminate(values, p, d3)) {
                return false
            }
        }
    }
    for (const u of units[s]) {
        let remainingValues: string[] = []
        for (const ss of u) {
            if (values[ss].indexOf(d2) != -1) {
                remainingValues.push(ss)
            }
        }
        if (remainingValues.length == 0) {
            return false
        }
        else if (remainingValues.length == 1) {
            if (!assign(values, remainingValues[0], d2)) {
                return false
            }
        }
    }
    return true
}
function search(values: Record<string, string>): boolean | Record<string, string> {
    let solved = true
    for (const s of squares) {
        if (values[s].length != 1) {
            solved = false
            break
        }
    }
    if (solved) return values

    let min = "a1"
    for (const s of squares) {
        if (values[s].length > 1) {
            if (values[min].length == 1) {
                min = s
                continue
            }
            if (values[s].length < min.length) {
                min = s
            }
        }
    }

    for (const d of values[min]) {
        let copied = structuredClone(values)
        if (assign(copied, min, d)) {
            let result = search(copied)
            if (result) {
                return result
            }
        }
    }

    return false
}
function display(values: boolean | Record<string, string>) {
    switch (values) {
        case true:
        case false:
            console.log("invalid sudoku")
            return
    }
    let max: string = ''
    for (const s of squares) {
        if (values[s].length > max.length) {
            max = values[s]
        }
    }
    let width = 1 + max.length
    let lineSeparator = '-'.repeat(width + 1).repeat(3)
    lineSeparator = [lineSeparator, lineSeparator, lineSeparator].join('+')
    let result: string = ""
    for (const r of rows) {
        let line = ""
        for (const c of cols) {
            let s = r + c
            line = line + values[s].padStart(width, ' ') + ' '
            if (c == '3' || c == '6') {
                line = line + '|'
            }
        }
        result = result + line + "\n"
        if (r == 'c' || r == 'f') {
            result = result + lineSeparator + "\n"
        }
    }
    console.log(result)
    return result
}
function loadGrid(puzzle: string, fillGrid: boolean = true): Record<string, string> {
    if (puzzle.length != 81) {
        throw new Error("invalid puzzle data");
    }
    let values: Record<string, string> = {}
    for (const s of squares) {
        values[s] = digits.join('')
    }
    let gridValues = zip(squares, puzzle.split(''))
    for (const gv of gridValues) {
        //console.log(gv)
        let s = gv[0]
        let d = gv[1]
        if (fillGrid) {
            if (digits.indexOf(d) != -1 && !assign(values, s, d)) {
                throw new Error("unable to assign grid value");
            }
        } else {
            values[s] = d
        }
    }
    return values
}
function gridtostring(grid: number[][]): string {
    return flatten(grid).join("")
}
function gridtostring2(grid: number[][]): string {
    //return grid.flat().join("")
    let result: string = ""
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            result = result + grid[i][j]
        }
    }
    return result
}
function loadgrid2(puzzle: number[][], fillGrid: boolean = true): Record<string, string> {
    return loadGrid(gridtostring(puzzle), fillGrid)
}
function loadgrid3(puzzle: number[][], fillGrid: boolean = true): Record<string, string> {
    return loadGrid(gridtostring2(puzzle), fillGrid)
}
function sudokutogrid(values: boolean | Record<string, string>): number[][] {
    let result: number[][] = []
    switch (values) {
        case true:
        case false:
            return result
    }
    for (const r of rows) {
        let row: number[] = []
        for (const c of cols) {
            row.push(parseInt(values[r + c]))
        }
        result.push(row)
    }
    return result
}

let digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
let rows = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
let cols = digits
let squares = cross(rows, cols)
let unitlist: string[][] = []
for (const c of cols) {
    unitlist.push(cross(rows, [c]))
}
for (const r of rows) {
    unitlist.push(cross([r], cols))
}
for (const rs of [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']]) {
    for (const cs of [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']]) {
        unitlist.push(cross(rs, cs))
    }
}
let units: Record<string, string[][]> = {}
for (const s of squares) {
    units[s] = unitlist.filter((v, i, a) => {
        return v.indexOf(s) != -1
    })
}
let peers: Record<string, string[]> = {}
for (const s of squares) {
    peers[s] = removeItemAll(flatten(units[s]), s);
}

// display(search(loadGrid("530070000600195000098000060800060003400803001700020006060000280000419005000080079")))
// display(search(loadGrid("006020050002000194000100207607082019085070030000605400090013040001009000730008900")))
// display(search(loadGrid("605720039400005100020100004090030706100809005204050080800003020002900001350067408")))
// display(search(loadGrid("046000000902060008008400250000800070500702003010006000064003900300080102000000730")))
// display(search(loadGrid("600108203020040090803005400504607009030000050700803102001700906080030020302904005")))
// display(search(loadGrid("019060540000000000820974036001503800000000000002701600750138092000000000083040710")))
// display(search(loadGrid("008030540300407900410008002043502060500000008060309410100800027005603004029070800")))

function sudoku(puzzle: number[][]) {
    //return the solved puzzle as a 2d array of 9 x 9
    const result = search(loadgrid3(puzzle));
    return sudokutogrid(result);
}

console.table(sudoku([
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]]))