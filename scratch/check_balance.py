
import sys

def check_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    line = 1
    col = 0
    for i, char in enumerate(content):
        if char == '\n':
            line += 1
            col = 0
        else:
            col += 1
            
        if char == '{':
            stack.append(('{', line, col))
        elif char == '}':
            if not stack or stack[-1][0] != '{':
                print(f"Excess '}}' at line {line}, col {col}")
                return
            stack.pop()
        elif char == '(':
            stack.append(('(', line, col))
        elif char == ')':
            if not stack or stack[-1][0] != '(':
                print(f"Excess ')' at line {line}, col {col}")
                # return # keep going to see more
            else:
                stack.pop()
                
    if stack:
        for s in stack:
            print(f"Unclosed '{s[0]}' at line {s[1]}, col {s[2]}")
    else:
        print("Balanced (as far as simple brackets go)")

check_balance(r'd:\FCO\DA\DAU\Sem 2\System Engineering\sai\src\pages\dashboard\InstamartDashboard.tsx')
