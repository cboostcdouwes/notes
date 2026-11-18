// X11: explain a ring mismatch as insertions, removals and replacements (edit script of a minimal alignment).
fn diff(declared: &[&str], found: &[&str]) -> Vec<String> {
    let (n, m) = (declared.len(), found.len());
    // cost[i][j]: edits to turn declared[i..] into found[j..]
    let mut cost = vec![vec![0usize; m + 1]; n + 1];
    for i in (0..=n).rev() {
        for j in (0..=m).rev() {
            cost[i][j] = if i == n { m - j } else if j == m { n - i } else if declared[i] == found[j] { cost[i + 1][j + 1] } else {
                1 + cost[i + 1][j + 1].min(cost[i + 1][j]).min(cost[i][j + 1])
            };
        }
    }
    let (mut i, mut j, mut out) = (0, 0, Vec::new());
    while i < n || j < m {
        if i < n && j < m && declared[i] == found[j] { i += 1; j += 1; }
        else if i < n && j < m && cost[i][j] == 1 + cost[i + 1][j + 1] { out.push(format!("position {j}: declared {}, found {}", declared[i], found[j])); i += 1; j += 1; }
        else if j < m && (i == n || cost[i][j] == 1 + cost[i][j + 1]) { out.push(format!("position {j}: {} is on the ring but not in the machine file (inserted?)", found[j])); j += 1; }
        else { out.push(format!("position {j}: declared {} at position {i} is missing from the ring (removed?)", declared[i])); i += 1; }
    }
    out
}

fn main() {
    let declared = ["EK1100", "EL1008", "EL1008", "EL2008", "EL2008", "EL2008", "EL4002", "EL6224", "EL1084"];
    let cases: [(&str, Vec<&str>); 4] = [
        ("an EL1008 inserted after the coupler", vec!["EK1100", "EL1008", "EL1008", "EL1008", "EL2008", "EL2008", "EL2008", "EL4002", "EL6224", "EL1084"]),
        ("the EL4002 removed", vec!["EK1100", "EL1008", "EL1008", "EL2008", "EL2008", "EL2008", "EL6224", "EL1084"]),
        ("two terminals swapped", vec!["EK1100", "EL1008", "EL1008", "EL2008", "EL2008", "EL2008", "EL6224", "EL4002", "EL1084"]),
        ("an EL2008 replaced by an EL2004", vec!["EK1100", "EL1008", "EL1008", "EL2008", "EL2004", "EL2008", "EL4002", "EL6224", "EL1084"]),
    ];
    for (name, found) in cases {
        let positional = declared.iter().zip(&found).filter(|(d, f)| d != f).count() + declared.len().abs_diff(found.len());
        println!("{name}: position by position {positional} mismatch(es); aligned:");
        for line in diff(&declared, &found) { println!("    {line}"); }
    }
}
