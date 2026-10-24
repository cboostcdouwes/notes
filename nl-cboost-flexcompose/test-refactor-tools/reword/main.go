// reword applies one meaning-preserving rewording to one prose string literal at a time in the
// module at os.Args[1], runs go test, and reports which top-level tests fail.
package main

import (
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

var rules = [][2]string{{" does not ", " doesn't "}, {" is not ", " isn't "}, {" the ", " this "}, {", ", "; "}, {" a ", " one "}}

type lit struct {
	file       string
	start, end int
	value      string
}

func main() {
	dir := os.Args[1]
	files, _ := filepath.Glob(filepath.Join(dir, "*.go"))
	var lits []lit
	for _, f := range files {
		if strings.HasSuffix(f, "_test.go") {
			continue
		}
		fset := token.NewFileSet()
		af, err := parser.ParseFile(fset, f, nil, 0)
		if err != nil {
			panic(err)
		}
		ast.Inspect(af, func(n ast.Node) bool {
			if _, ok := n.(*ast.ImportSpec); ok {
				return false
			}
			b, ok := n.(*ast.BasicLit)
			if !ok || b.Kind != token.STRING || strings.Count(b.Value, " ") < 3 {
				return true
			}
			lits = append(lits, lit{f, fset.Position(b.Pos()).Offset, fset.Position(b.End()).Offset, b.Value})
			return true
		})
	}
	failRE := regexp.MustCompile(`(?m)^--- FAIL: (\w+)`)
	hist := map[int]int{}
	total, applied := 0, 0
	for _, l := range lits {
		var from, to string
		for _, r := range rules {
			if strings.Contains(l.value, r[0]) {
				from, to = r[0], r[1]
				break
			}
		}
		if from == "" {
			continue
		}
		applied++
		orig, _ := os.ReadFile(l.file)
		mut := string(orig[:l.start]) + strings.Replace(l.value, from, to, 1) + string(orig[l.end:])
		os.WriteFile(l.file, []byte(mut), 0o644)
		cmd := exec.Command("go", "test", "-count=1", "./...")
		cmd.Dir = dir
		out, _ := cmd.CombinedOutput()
		os.WriteFile(l.file, orig, 0o644)
		failed := map[string]bool{}
		for _, m := range failRE.FindAllStringSubmatch(string(out), -1) {
			failed[m[1]] = true
		}
		var names []string
		for n := range failed {
			names = append(names, n)
		}
		sort.Strings(names)
		hist[len(names)]++
		total += len(names)
		short := l.value
		if len(short) > 70 {
			short = short[:70] + "..."
		}
		fmt.Printf("%s:%d %q->%q fails %d %v\n  %s\n", filepath.Base(l.file), l.start, from, to, len(names), names, short)
	}
	fmt.Printf("\nrewordings: %d, test failures: %d, histogram (tests failed -> rewordings): %v\n", applied, total, hist)
}
