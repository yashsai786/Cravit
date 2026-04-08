
with open(r'd:\FCO\DA\DAU\Sem 2\System Engineering\sai\src\pages\dashboard\InstamartDashboard.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 377 (index 376) is <div className="space-y-10">
# Line 459 (index 458) is )} and needs a closing div before it.

if '          )}' in lines[458]:
    lines[458] = '          </div>\n        )}\n'
    with open(r'd:\FCO\DA\DAU\Sem 2\System Engineering\sai\src\pages\dashboard\InstamartDashboard.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Fixed successfully")
else:
    print(f"Content mismatch at line 459: '{lines[458]}'")
