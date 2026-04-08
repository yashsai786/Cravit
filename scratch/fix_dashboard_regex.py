
path = r'd:\FCO\DA\DAU\Sem 2\System Engineering\sai\src\pages\dashboard\InstamartDashboard.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# We need to find the specific )} after the inventory table.
# A safe anchor is </tbody>\s*</table>\s*</div>\s*)}

import re
pattern = re.compile(r'(</tbody>\s*</table>\s*</div>)(\s*)\)', re.MULTILINE)
new_text = pattern.sub(r'\1\2  </div>\2)', text)

if new_text != text:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_text)
    print("Fixed successfully via regex")
else:
    print("Regex failed to find pattern")
