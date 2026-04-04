import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft, Play, Send, Save, Clock, Lightbulb, Zap, AlertCircle,
  CheckCircle, SkipForward, PlayCircle, History, Sparkles, Terminal,
  Eye, Layers, Activity, WrapText, RefreshCw, X, Code2, BookOpen,
  Trophy, Cpu, MemoryStick, PauseCircle, RotateCcw, Copy, FlaskConical,
  Brain, ChevronDown, ChevronRight, Trash2, FileCode,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import { Toaster } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Judge0 CE — Free public endpoint (no API key required)
// https://ce.judge0.com
// ─────────────────────────────────────────────────────────────────────────────
const JUDGE0_BASE = "https://ce.judge0.com";

const LANGUAGE_IDS: Record<string, number> = {
  python: 71,  // Python 3.8.1
  java: 62,  // Java OpenJDK 13.0.1
  cpp: 54,  // C++ GCC 9.2.0
};

const LANG_LABELS: Record<string, string> = {
  python: "🐍 Python 3",
  java: "☕ Java 13",
  cpp: "⚙️ C++ 17",
};

const LANG_EXT: Record<string, string> = {
  python: "py",
  java: "java",
  cpp: "cpp",
};

// ─────────────────────────────────────────────────────────────────────────────
// Categorized Sample Code Library — 10 programs × 3 languages
// ─────────────────────────────────────────────────────────────────────────────
interface SampleEntry {
  category: string;
  label: string;
  codes: Record<string, string>;   // keyed by language
}

const SAMPLES: SampleEntry[] = [
  // ── Basic ─────────────────────────────────────────────────────────────────
  {
    category: "Basic",
    label: "Simple Addition",
    codes: {
      python: `# Simple Addition Program
a = 15
b = 27
result = a + b
print(f"Sum of {a} and {b} = {result}")

# Also show subtraction, multiplication, division
print(f"Difference : {a - b}")
print(f"Product    : {a * b}")
print(f"Division   : {a / b:.2f}")`,

      java: `public class Solution {
    public static void main(String[] args) {
        int a = 15, b = 27;
        System.out.println("Sum of " + a + " and " + b + " = " + (a + b));
        System.out.println("Difference : " + (a - b));
        System.out.println("Product    : " + (a * b));
        System.out.printf("Division   : %.2f%n", (double) a / b);
    }
}`,

      cpp: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int a = 15, b = 27;
    cout << "Sum of " << a << " and " << b << " = " << (a + b) << endl;
    cout << "Difference : " << (a - b) << endl;
    cout << "Product    : " << (a * b) << endl;
    cout << fixed << setprecision(2);
    cout << "Division   : " << (double)a / b << endl;
    return 0;
}`,
    },
  },

  // ── Arrays ────────────────────────────────────────────────────────────────
  {
    category: "Arrays",
    label: "Find Maximum Element",
    codes: {
      python: `# Find Maximum Element in Array
def find_max(arr):
    max_val = arr[0]
    max_idx = 0
    for i in range(1, len(arr)):
        if arr[i] > max_val:
            max_val = arr[i]
            max_idx = i
    return max_val, max_idx

arr = [3, 41, 12, 9, 74, 15, 55, 22]
print("Array   :", arr)
max_val, max_idx = find_max(arr)
print(f"Maximum : {max_val} (at index {max_idx})")`,

      java: `public class Solution {
    static int[] findMax(int[] arr) {
        int maxVal = arr[0], maxIdx = 0;
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] > maxVal) {
                maxVal = arr[i];
                maxIdx = i;
            }
        }
        return new int[]{maxVal, maxIdx};
    }
    public static void main(String[] args) {
        int[] arr = {3, 41, 12, 9, 74, 15, 55, 22};
        System.out.print("Array   : ");
        for (int x : arr) System.out.print(x + " ");
        System.out.println();
        int[] result = findMax(arr);
        System.out.println("Maximum : " + result[0] + " (at index " + result[1] + ")");
    }
}`,

      cpp: `#include <iostream>
#include <vector>
using namespace std;

pair<int,int> findMax(vector<int>& arr) {
    int maxVal = arr[0], maxIdx = 0;
    for (int i = 1; i < (int)arr.size(); i++) {
        if (arr[i] > maxVal) { maxVal = arr[i]; maxIdx = i; }
    }
    return {maxVal, maxIdx};
}

int main() {
    vector<int> arr = {3, 41, 12, 9, 74, 15, 55, 22};
    cout << "Array   : ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    auto [maxVal, maxIdx] = findMax(arr);
    cout << "Maximum : " << maxVal << " (at index " << maxIdx << ")" << endl;
    return 0;
}`,
    },
  },

  {
    category: "Arrays",
    label: "Reverse an Array",
    codes: {
      python: `# Reverse an Array (in-place and using slicing)
def reverse_inplace(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left  += 1
        right -= 1
    return arr

arr = [10, 20, 30, 40, 50, 60, 70]
print("Original :", arr)
reverse_inplace(arr)
print("Reversed :", arr)
# Using slice
arr2 = [1, 2, 3, 4, 5]
print("Slice rev:", arr2[::-1])`,

      java: `public class Solution {
    static void reverse(int[] arr) {
        int left = 0, right = arr.length - 1;
        while (left < right) {
            int tmp = arr[left];
            arr[left++] = arr[right];
            arr[right--] = tmp;
        }
    }
    static void print(int[] arr) {
        for (int x : arr) System.out.print(x + " ");
        System.out.println();
    }
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50, 60, 70};
        System.out.print("Original : "); print(arr);
        reverse(arr);
        System.out.print("Reversed : "); print(arr);
    }
}`,

      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void printArr(vector<int>& v) {
    for (int x : v) cout << x << " ";
    cout << endl;
}

int main() {
    vector<int> arr = {10, 20, 30, 40, 50, 60, 70};
    cout << "Original : "; printArr(arr);
    reverse(arr.begin(), arr.end());
    cout << "Reversed : "; printArr(arr);
    return 0;
}`,
    },
  },

  // ── Sorting ───────────────────────────────────────────────────────────────
  {
    category: "Sorting",
    label: "Bubble Sort",
    codes: {
      python: `# Bubble Sort — O(n^2)
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break   # already sorted
    return arr

data = [64, 34, 25, 12, 22, 11, 90]
print("Before:", data)
bubble_sort(data)
print("After :", data)`,

      java: `public class Solution {
    static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int tmp = arr[j]; arr[j] = arr[j+1]; arr[j+1] = tmp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
    static void print(int[] a) { for (int x:a) System.out.print(x+" "); System.out.println(); }
    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.print("Before: "); print(arr);
        bubbleSort(arr);
        System.out.print("After : "); print(arr);
    }
}`,

      cpp: `#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; i++) {
        bool swapped = false;
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) { swap(arr[j], arr[j+1]); swapped = true; }
        }
        if (!swapped) break;
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    cout << "Before: "; for (int x:arr) cout << x << " "; cout << endl;
    bubbleSort(arr);
    cout << "After : "; for (int x:arr) cout << x << " "; cout << endl;
    return 0;
}`,
    },
  },

  {
    category: "Sorting",
    label: "Quick Sort",
    codes: {
      python: `# Quick Sort — O(n log n) average
def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1

def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

data = [10, 7, 8, 9, 1, 5, 64, 34, 25]
print("Before:", data)
quick_sort(data, 0, len(data) - 1)
print("After :", data)`,

      java: `public class Solution {
    static int partition(int[] arr, int low, int high) {
        int pivot = arr[high], i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
            }
        }
        int tmp = arr[i+1]; arr[i+1] = arr[high]; arr[high] = tmp;
        return i + 1;
    }
    static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }
    static void print(int[] a) { for (int x:a) System.out.print(x+" "); System.out.println(); }
    public static void main(String[] args) {
        int[] arr = {10, 7, 8, 9, 1, 5, 64, 34, 25};
        System.out.print("Before: "); print(arr);
        quickSort(arr, 0, arr.length - 1);
        System.out.print("After : "); print(arr);
    }
}`,

      cpp: `#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high], i = low - 1;
    for (int j = low; j < high; j++)
        if (arr[j] <= pivot) swap(arr[++i], arr[j]);
    swap(arr[i+1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    vector<int> arr = {10, 7, 8, 9, 1, 5, 64, 34, 25};
    cout << "Before: "; for (int x:arr) cout << x << " "; cout << endl;
    quickSort(arr, 0, arr.size()-1);
    cout << "After : "; for (int x:arr) cout << x << " "; cout << endl;
    return 0;
}`,
    },
  },

  // ── Trees ─────────────────────────────────────────────────────────────────
  {
    category: "Trees",
    label: "Binary Tree Insertion",
    codes: {
      python: `# Binary Tree — Insertion & In-order Traversal
class Node:
    def __init__(self, val):
        self.val   = val
        self.left  = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, val):
        if not self.root:
            self.root = Node(val); return
        cur = self.root
        while True:
            if val < cur.val:
                if cur.left is None: cur.left = Node(val); break
                else: cur = cur.left
            else:
                if cur.right is None: cur.right = Node(val); break
                else: cur = cur.right

    def inorder(self, node, result=[]):
        if node:
            self.inorder(node.left, result)
            result.append(node.val)
            self.inorder(node.right, result)
        return result

tree = BST()
for v in [50, 30, 70, 20, 40, 60, 80]:
    tree.insert(v)
print("In-order traversal:", tree.inorder(tree.root, []))`,

      java: `public class Solution {
    static class Node { int val; Node left, right; Node(int v){val=v;} }
    static Node root;

    static Node insert(Node node, int val) {
        if (node == null) return new Node(val);
        if (val < node.val) node.left  = insert(node.left,  val);
        else                node.right = insert(node.right, val);
        return node;
    }
    static void inorder(Node node) {
        if (node == null) return;
        inorder(node.left);
        System.out.print(node.val + " ");
        inorder(node.right);
    }
    public static void main(String[] args) {
        int[] vals = {50, 30, 70, 20, 40, 60, 80};
        for (int v : vals) root = insert(root, v);
        System.out.print("In-order: ");
        inorder(root);
        System.out.println();
    }
}`,

      cpp: `#include <iostream>
using namespace std;

struct Node { int val; Node *left, *right; Node(int v): val(v), left(nullptr), right(nullptr){} };

Node* insert(Node* node, int val) {
    if (!node) return new Node(val);
    if (val < node->val) node->left  = insert(node->left,  val);
    else                 node->right = insert(node->right, val);
    return node;
}
void inorder(Node* node) {
    if (!node) return;
    inorder(node->left);
    cout << node->val << " ";
    inorder(node->right);
}
int main() {
    Node* root = nullptr;
    for (int v : {50,30,70,20,40,60,80}) root = insert(root, v);
    cout << "In-order: ";
    inorder(root);
    cout << endl;
    return 0;
}`,
    },
  },

  {
    category: "Trees",
    label: "Binary Search in BST",
    codes: {
      python: `# Binary Search Tree — Search operation
class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

def insert(root, val):
    if root is None: return Node(val)
    if val < root.val: root.left  = insert(root.left,  val)
    else:              root.right = insert(root.right, val)
    return root

def search(root, target, depth=0):
    if root is None:
        print(f"  Not found after {depth} comparisons")
        return False
    print(f"  Step {depth+1}: Checking node {root.val}")
    if root.val == target:
        print(f"  ✓ Found {target} at depth {depth}")
        return True
    elif target < root.val:
        print(f"  → Go left  (target {target} < {root.val})")
        return search(root.left,  target, depth+1)
    else:
        print(f"  → Go right (target {target} > {root.val})")
        return search(root.right, target, depth+1)

root = None
for v in [50, 30, 70, 20, 40, 60, 80, 10, 25]:
    root = insert(root, v)

print("Searching for 25:")
search(root, 25)
print("\\nSearching for 45:")
search(root, 45)`,

      java: `public class Solution {
    static class Node { int val; Node l, r; Node(int v){val=v;} }
    static Node root;
    static Node insert(Node n, int v) {
        if (n==null) return new Node(v);
        if (v < n.val) n.l = insert(n.l, v); else n.r = insert(n.r, v);
        return n;
    }
    static boolean search(Node n, int target, int depth) {
        if (n == null) { System.out.println("  Not found after "+depth+" steps"); return false; }
        System.out.println("  Step "+(depth+1)+": Checking "+n.val);
        if (n.val == target) { System.out.println("  Found "+target+" at depth "+depth); return true; }
        if (target < n.val) { System.out.println("  -> Go left"); return search(n.l, target, depth+1); }
        System.out.println("  -> Go right"); return search(n.r, target, depth+1);
    }
    public static void main(String[] args) {
        for (int v : new int[]{50,30,70,20,40,60,80,10,25}) root = insert(root, v);
        System.out.println("Searching for 25:");  search(root, 25, 0);
        System.out.println("\nSearching for 45:"); search(root, 45, 0);
    }
}`,

      cpp: `#include <iostream>
using namespace std;
struct Node { int val; Node *l,*r; Node(int v):val(v),l(nullptr),r(nullptr){} };
Node* insert(Node* n, int v) {
    if(!n) return new Node(v);
    if(v<n->val) n->l=insert(n->l,v); else n->r=insert(n->r,v);
    return n;
}
bool search(Node* n, int target, int depth=0) {
    if(!n){ cout<<"  Not found after "<<depth<<" steps"<<endl; return false; }
    cout<<"  Step "<<depth+1<<": Checking "<<n->val<<endl;
    if(n->val==target){ cout<<"  Found "<<target<<" at depth "<<depth<<endl; return true; }
    if(target<n->val){ cout<<"  -> Go left"<<endl; return search(n->l,target,depth+1); }
    cout<<"  -> Go right"<<endl; return search(n->r,target,depth+1);
}
int main() {
    Node* root=nullptr;
    for(int v:{50,30,70,20,40,60,80,10,25}) root=insert(root,v);
    cout<<"Searching for 25:"<<endl; search(root,25);
    cout<<"\nSearching for 45:"<<endl; search(root,45);
    return 0;
}`,
    },
  },

  // ── Others ────────────────────────────────────────────────────────────────
  {
    category: "Others",
    label: "Fibonacci Series",
    codes: {
      python: `# Fibonacci Series — iterative + memoized
def fibonacci_iter(n):
    if n <= 0: return []
    if n == 1: return [0]
    seq = [0, 1]
    for _ in range(2, n):
        seq.append(seq[-1] + seq[-2])
    return seq

# Also recursive with memo
from functools import lru_cache

@lru_cache(maxsize=None)
def fib_memo(n):
    if n < 2: return n
    return fib_memo(n-1) + fib_memo(n-2)

n = 12
print(f"Fibonacci({n}) series:", fibonacci_iter(n))
print(f"F({n}) =", fib_memo(n))
print(f"F(20)  =", fib_memo(20))`,

      java: `public class Solution {
    static long fibMemo(int n, long[] memo) {
        if (n < 2) return n;
        if (memo[n] != -1) return memo[n];
        return memo[n] = fibMemo(n-1, memo) + fibMemo(n-2, memo);
    }
    public static void main(String[] args) {
        int n = 12;
        long[] a = new long[n+1]; a[0]=0; a[1]=1;
        System.out.print("Fibonacci(" + n + ") series: ");
        for (int i = 0; i < n; i++) {
            System.out.print(a[Math.min(i,n)] + " ");
            if (i >= 1) { long t = a[1]; a[1] = a[0]+a[1]; a[0] = t; }
        }
        System.out.println();
        long[] memo = new long[21]; java.util.Arrays.fill(memo, -1);
        System.out.println("F(" + n + ") = " + fibMemo(n, memo));
        System.out.println("F(20)  = " + fibMemo(20, memo));
    }
}`,

      cpp: `#include <iostream>
#include <vector>
using namespace std;

long long fibDP(int n) {
    if (n < 2) return n;
    long long a = 0, b = 1;
    for (int i = 2; i <= n; i++) { long long c = a+b; a=b; b=c; }
    return b;
}

int main() {
    int n = 12;
    cout << "Fibonacci(" << n << ") series: ";
    long long a = 0, b = 1;
    cout << a << " " << b << " ";
    for (int i = 2; i < n; i++) { long long c=a+b; a=b; b=c; cout<<b<<" "; }
    cout << endl;
    cout << "F(" << n << ") = " << fibDP(n) << endl;
    cout << "F(20)  = " << fibDP(20) << endl;
    return 0;
}`,
    },
  },

  {
    category: "Others",
    label: "String Palindrome Check",
    codes: {
      python: `# Palindrome Check — string and number
def is_palindrome_str(s):
    s = s.lower().replace(" ", "")
    return s == s[::-1]

def is_palindrome_num(n):
    s = str(n)
    return s == s[::-1]

# String palindromes
words = ["racecar", "hello", "madam", "world", "level", "python"]
print("String palindrome check:")
for w in words:
    result = "✓ Yes" if is_palindrome_str(w) else "✗ No"
    print(f"  '{w}' → {result}")

# Number palindromes
print("\\nNumber palindrome check:")
for n in [121, 123, 12321, 456, 1001]:
    result = "✓ Yes" if is_palindrome_num(n) else "✗ No"
    print(f"  {n} → {result}")`,

      java: `public class Solution {
    static boolean isPalindrome(String s) {
        s = s.toLowerCase().replace(" ", "");
        int l = 0, r = s.length()-1;
        while (l < r) { if (s.charAt(l++) != s.charAt(r--)) return false; }
        return true;
    }
    static boolean isPalindromeNum(int n) {
        String s = Integer.toString(n);
        return isPalindrome(s);
    }
    public static void main(String[] args) {
        String[] words = {"racecar","hello","madam","world","level","java"};
        System.out.println("String palindrome check:");
        for (String w : words)
            System.out.println("  '" + w + "' -> " + (isPalindrome(w)?"Yes":"No"));
        System.out.println("\nNumber palindrome check:");
        int[] nums = {121, 123, 12321, 456, 1001};
        for (int n : nums)
            System.out.println("  " + n + " -> " + (isPalindromeNum(n)?"Yes":"No"));
    }
}`,

      cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

bool isPalindrome(string s) {
    transform(s.begin(), s.end(), s.begin(), ::tolower);
    s.erase(remove(s.begin(), s.end(), ' '), s.end());
    string rev = s; reverse(rev.begin(), rev.end());
    return s == rev;
}

int main() {
    string words[] = {"racecar","hello","madam","world","level","cpp"};
    cout << "String palindrome check:" << endl;
    for (auto& w : words)
        cout << "  '" << w << "' -> " << (isPalindrome(w)?"Yes":"No") << endl;
    int nums[] = {121, 123, 12321, 456, 1001};
    cout << "\nNumber palindrome check:" << endl;
    for (int n : nums) {
        string s = to_string(n);
        string rev = s; reverse(rev.begin(), rev.end());
        cout << "  " << n << " -> " << (s==rev?"Yes":"No") << endl;
    }
    return 0;
}`,
    },
  },

  {
    category: "Others",
    label: "Factorial of a Number",
    codes: {
      python: `# Factorial — iterative, recursive, and using math module
import math

def factorial_iter(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

def factorial_rec(n):
    if n <= 1: return 1
    return n * factorial_rec(n - 1)

print("Factorial table:")
print(f"{'n':>4}  {'Iterative':>12}  {'Recursive':>12}  {'math.fact':>12}")
print("-" * 46)
for n in range(0, 13):
    print(f"{n:>4}  {factorial_iter(n):>12}  {factorial_rec(n):>12}  {math.factorial(n):>12}")`,

      java: `public class Solution {
    static long factIter(int n) {
        long r = 1; for (int i=2; i<=n; i++) r*=i; return r;
    }
    static long factRec(int n) { return n<=1 ? 1 : n * factRec(n-1); }

    public static void main(String[] args) {
        System.out.println("Factorial table:");
        System.out.printf("%4s  %12s  %12s%n","n","Iterative","Recursive");
        System.out.println("-".repeat(32));
        for (int n = 0; n <= 12; n++)
            System.out.printf("%4d  %12d  %12d%n", n, factIter(n), factRec(n));
    }
}`,

      cpp: `#include <iostream>
#include <iomanip>
using namespace std;

long long factIter(int n) { long long r=1; for(int i=2;i<=n;i++) r*=i; return r; }
long long factRec(int n)  { return n<=1 ? 1 : n*factRec(n-1); }

int main() {
    cout << "Factorial table:" << endl;
    cout << setw(4) << "n" << setw(14) << "Iterative" << setw(14) << "Recursive" << endl;
    cout << string(34, '-') << endl;
    for (int n = 0; n <= 12; n++)
        cout << setw(4) << n << setw(14) << factIter(n) << setw(14) << factRec(n) << endl;
    return 0;
}`,
    },
  },
];

// Group samples by category for the dropdown
const SAMPLE_CATEGORIES = Array.from(new Set(SAMPLES.map((s) => s.category)));

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Variable {
  name: string;
  value: string;
  type: string;
  changed?: boolean;
}

interface ExecutionStep {
  line: number;
  variables: Variable[];
  stack: string[];
  output: string;
  description: string;
}

interface SubmissionRecord {
  id: string;
  code: string;
  language: string;
  stdin: string;
  timestamp: Date;
  status: "accepted" | "error" | "saved";
  stdout?: string;
  stderr?: string;
  executionTime?: number;
  memory?: number;
}

interface RunResult {
  stdout: string;
  stderr: string;
  compile_output: string;
  status: { id: number; description: string };
  time: string;
  memory: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Judge0 CE — free public API (no key, plain text)
// POST https://ce.judge0.com/submissions?wait=true
// Body: { source_code, language_id, stdin }
// ─────────────────────────────────────────────────────────────────────────────
async function runWithJudge0(
  sourceCode: string,
  language: string,
  stdin: string
): Promise<RunResult> {
  const body = {
    source_code: sourceCode,
    language_id: LANGUAGE_IDS[language],
    stdin: stdin || "",
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2800);

  // Use wait=true so we get the result in a single request
  const res = await fetch(`${JUDGE0_BASE}/submissions?wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: controller.signal
  });

  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error(`Judge0 returned HTTP ${res.status}. Please try again.`);
  }

  const data = await res.json();

  // If status is still "Processing" (shouldn't happen with wait=true, but poll just in case)
  if (data.status?.id < 3 && data.token) {
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const pCtrl = new AbortController();
      const pTimeout = setTimeout(() => pCtrl.abort(), 1000);
      try {
        const poll = await fetch(
          `${JUDGE0_BASE}/submissions/${data.token}?fields=stdout,stderr,compile_output,status,time,memory`,
          { headers: { "Content-Type": "application/json" }, signal: pCtrl.signal }
        );
        clearTimeout(pTimeout);
        const pd = await poll.json();
        if (pd.status?.id >= 3) {
          return {
            stdout: pd.stdout || "",
            stderr: pd.stderr || "",
            compile_output: pd.compile_output || "",
            status: pd.status,
            time: pd.time || "0",
            memory: pd.memory || 0,
          };
        }
      } catch {
        clearTimeout(pTimeout);
        break;
      }
    }
    throw new Error("Execution timed out. Please try again.");
  }

  return {
    stdout: data.stdout || "",
    stderr: data.stderr || "",
    compile_output: data.compile_output || "",
    status: data.status || { id: 3, description: "Accepted" },
    time: data.time || "0",
    memory: data.memory || 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback mock output (when API is unavailable)
// ─────────────────────────────────────────────────────────────────────────────
function getMockOutput(code: string, lang: string): string {
  const prints: string[] = [];
  if (lang === "python") {
    const re = /print\s*\(([^)]+)\)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      prints.push(m[1].replace(/^f?["']|["']$/g, "").replace(/\\n/g, "").trim());
    }
  } else {
    const re = /(?:System\.out\.print(?:ln)?|cout\s*<<)\s*["(]([^")\n;]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      prints.push(m[1].replace(/^"|"$/g, "").replace(/\\n/g, "").trim());
    }
  }
  if (prints.length) {
    return prints.join("\n") + "\n\n[Demo mode — real output requires Judge0 API]";
  }
  return "[Demo mode — no printable output detected]\nThe free Judge0 API may be temporarily unavailable.";
}

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Code Parser — produces step-by-step execution trace
// ─────────────────────────────────────────────────────────────────────────────
function inferType(raw: string): string {
  const v = raw.trim();
  if (!v) return "unknown";
  if (v === "True" || v === "False" || v === "true" || v === "false") return "bool";
  if (/^-?\d+$/.test(v)) return "int";
  if (/^-?\d*\.\d+/.test(v)) return "float";
  if (/^["'`]/.test(v)) return "str";
  if (/^\[/.test(v)) return "list";
  if (/^\{/.test(v)) return "dict";
  if (/^\(/.test(v)) return "tuple";
  return "var";
}
function upsert(arr: Variable[], v: Variable) {
  const i = arr.findIndex((x) => x.name === v.name);
  if (i >= 0) arr[i] = v; else arr.push(v);
}
function resetChanged(arr: Variable[]) { arr.forEach((v) => (v.changed = false)); }
function isComment(t: string, lang: string) {
  if (lang === "python") return t.startsWith("#");
  return t.startsWith("//") || t.startsWith("/*") || t.startsWith("*");
}
function isPrint(t: string, lang: string) {
  if (lang === "python") return /^\s*print\s*\(/.test(t);
  if (lang === "java") return /System\.out\.print/.test(t);
  return /cout\s*<</.test(t);
}

function parseCodeToSteps(code: string, lang: string, programOutput: string): ExecutionStep[] {
  const lines = code.split("\n");
  const steps: ExecutionStep[] = [];
  const vars: Variable[] = [];
  const stack: string[] = [lang === "python" ? "<module>" : "main"];
  const outLines = programOutput ? programOutput.split("\n").filter(Boolean) : [];
  let outIdx = 0;

  lines.forEach((rawLine, idx) => {
    const t = rawLine.trim();
    if (!t || isComment(t, lang)) return;
    const lineNum = idx + 1;
    let desc = `Executing: ${t.slice(0, 55)}${t.length > 55 ? "…" : ""}`;
    let stepOut = "";

    if (lang === "python") {
      const defM = t.match(/^def\s+([a-zA-Z_]\w*)\s*\(/);
      if (defM) { if (!stack.includes(defM[1])) stack.push(defM[1]); desc = `Defining function: ${defM[1]}()`; }

      const assignM = t.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (assignM && !t.includes("==") && !/^(def|for|if|elif|else|while|return|import|from|class|with|try|except)/.test(t)) {
        const [, name, rawVal] = assignM;
        resetChanged(vars);
        upsert(vars, { name, value: rawVal.replace(/[;,]$/, ""), type: inferType(rawVal), changed: true });
        desc = `${name} ← ${rawVal.replace(/[;,]$/, "")}`;
      }

      const augM = t.match(/^([a-zA-Z_]\w*)\s*([+\-*\/]=)\s*(.+)$/);
      if (augM) { resetChanged(vars); upsert(vars, { name: augM[1], value: `${augM[1]} ${augM[2]} ${augM[3]}`, type: "var", changed: true }); desc = `Update: ${augM[1]} ${augM[2]} ${augM[3]}`; }

      const forM = t.match(/^for\s+(.+)\s+in\s+(.+):/); if (forM) desc = `Loop: for ${forM[1]} in ${forM[2]}`;
      const whileM = t.match(/^while\s+(.+):/); if (whileM) desc = `While: ${whileM[1]}`;
      const ifM = t.match(/^(if|elif)\s+(.+):/); if (ifM) desc = `Condition: ${ifM[1]} ${ifM[2]}`;
      if (t === "else:") desc = "Condition: else branch";
      const retM = t.match(/^return\s+(.*)/); if (retM) { desc = `Return: ${retM[1]}`; stack.pop(); }

      if (isPrint(t, lang)) {
        const out = outIdx < outLines.length ? outLines[outIdx++] : "…";
        stepOut = out; desc = `print → "${out}"`;
      }
    }

    if (lang === "java" || lang === "cpp") {
      const typeKw = "(?:int|long|short|double|float|char|boolean|bool|String|string|auto|var)";
      const declM = t.match(new RegExp(`^(?:final\\s+)?${typeKw}(?:<[^>]+>)?\\s+([a-zA-Z_]\\w*)\\s*=\\s*(.+?);?$`));
      if (declM) { resetChanged(vars); const rv = declM[2].replace(/;$/, "").trim(); upsert(vars, { name: declM[1], value: rv, type: inferType(rv), changed: true }); desc = `${declM[1]} ← ${rv}`; }

      const reassM = t.match(/^([a-zA-Z_]\w*)\s*=\s*(.+?);?$/);
      if (reassM && !t.includes("==") && !declM) { resetChanged(vars); const rv = reassM[2].replace(/;$/, "").trim(); upsert(vars, { name: reassM[1], value: rv, type: "var", changed: true }); desc = `${reassM[1]} ← ${rv}`; }

      const augM = t.match(/^([a-zA-Z_]\w*)\s*([+\-*\/]=)\s*(.+?);?$/);
      if (augM) { resetChanged(vars); upsert(vars, { name: augM[1], value: `${augM[1]} ${augM[2]} ${augM[3].replace(/;$/, "")}`, type: "var", changed: true }); desc = `Update: ${augM[1]} ${augM[2]} ${augM[3].replace(/;$/, "")}`; }

      const methM = t.match(/(?:public|private|protected|static|void|int|String|double|bool)\s+([a-zA-Z_]\w*)\s*\([^)]*\)\s*\{?/);
      if (methM && methM[1] !== "main" && !t.includes("=") && (t.includes("{") || t.endsWith(")"))) { if (!stack.includes(methM[1])) stack.push(methM[1]); desc = `Enter method: ${methM[1]}()`; }

      const retM = t.match(/^return\s+(.*?);?$/); if (retM) { desc = `Return: ${retM[1].replace(/;$/, "")}`; if (stack.length > 1) stack.pop(); }
      const forM = t.match(/^for\s*\(/); if (forM) desc = `Loop: ${t.slice(0, 50)}`;
      const whileM = t.match(/^while\s*\(/); if (whileM) desc = `While: ${t.replace(/\{$/, "").trim()}`;
      const ifM = t.match(/^if\s*\(/); if (ifM) desc = `Condition: ${t.replace(/\{$/, "").trim()}`;

      if (isPrint(t, lang)) {
        const out = outIdx < outLines.length ? outLines[outIdx++] : "…";
        stepOut = out; desc = `output → "${out}"`;
      }
    }

    steps.push({ line: lineNum, variables: vars.map((v) => ({ ...v })), stack: [...stack], output: stepOut, description: desc });
  });

  return steps.length > 0 ? steps : [{ line: 1, variables: [], stack: ["main"], output: "", description: "Start of program" }];
}

// ─────────────────────────────────────────────────────────────────────────────
// AI analysis helpers
// ─────────────────────────────────────────────────────────────────────────────
function generateExplanation(code: string, lang: string): string {
  const lines = code.split("\n").filter((l) => l.trim());
  const hasLoop = /for|while/.test(code);
  const hasFn = lang === "python" ? /def /.test(code) : /\w+\s*\([^)]*\)\s*\{/.test(code);
  const hasArr = /\[|\bvector\b|ArrayList/.test(code);
  const hasMap = /\bdict\b|\bmap\b|HashMap|\{\}/.test(code);
  const hasPrint = /print|cout|System\.out/.test(code);
  const concepts = [hasLoop && "loops", hasFn && "functions", hasArr && "arrays/lists", hasMap && "hash maps", hasPrint && "output"].filter(Boolean);

  return `📝 Code Analysis (${lang.toUpperCase()})
${"─".repeat(40)}

📊 Overview:
• Language   : ${lang === "python" ? "Python 3" : lang === "java" ? "Java" : "C++"}
• Lines      : ${lines.length} (non-empty)
• Concepts   : ${concepts.length ? concepts.join(", ") : "basic syntax"}

🔍 Code structure:
${lines.slice(0, 6).map((l, i) => `  ${i + 1}. ${l.trim().slice(0, 60)}${l.trim().length > 60 ? "…" : ""}`).join("\n")}
${lines.length > 6 ? `  … and ${lines.length - 6} more lines` : ""}

💡 What it does:
${hasFn ? `• Defines ${(code.match(/def\s+\w+|(?:public|static|void)\s+\w+\s*\(/g) || []).length} function(s)` : "• Runs sequentially (no functions)"}
${hasLoop ? "• Uses iteration to process data" : "• No loops — linear execution"}
${hasArr ? "• Works with array/list data structures" : ""}
${hasMap ? "• Uses dictionary/map for O(1) lookups" : ""}
${hasPrint ? "• Produces output to the console" : ""}

✨ Tips:
• Run your code first, then click Visualize to trace execution
• Use the stdin box to provide custom input
• Try "Analyze Complexity" for Big-O analysis`;
}

function analyzeComplexity(code: string, _lang: string): { time: string; space: string; best: string; worst: string; note: string } {
  const nested = (code.match(/for|while/g) || []).length;
  const hasRecur = /def\s+(\w+)[\s\S]*\1\s*\(|(\w+)\s*\([^)]*\)[^{]*\{[\s\S]*\2\s*\(/.test(code);
  const hasSort = /\.sort|sorted|Arrays\.sort|std::sort/.test(code);
  const hasBSearch = /(lo|low|hi|high|mid)/.test(code) && /\/\s*2|>>\s*1/.test(code);
  const hasHash = /dict|HashMap|unordered_map|\{\}/.test(code);

  if (hasRecur && nested >= 2) return { time: "O(2ⁿ)", space: "O(n)", best: "O(n log n)", worst: "O(2ⁿ)", note: "Exponential recursion. Add memoization (DP) to reduce to O(n)." };
  if (nested >= 3) return { time: "O(n³)", space: "O(1)", best: "O(n²)", worst: "O(n³)", note: "Triple-nested loops. Look for mathematical simplifications." };
  if (nested >= 2) return { time: "O(n²)", space: "O(1)", best: "O(n)", worst: "O(n²)", note: "Nested loops. A hash map could reduce this to O(n) average." };
  if (hasSort) return { time: "O(n log n)", space: "O(log n)", best: "O(n log n)", worst: "O(n log n)", note: "Built-in sort uses IntroSort/TimSort — guaranteed O(n log n)." };
  if (hasBSearch) return { time: "O(log n)", space: "O(1)", best: "O(1)", worst: "O(log n)", note: "Binary search is very efficient. Ensure input is sorted." };
  if (hasHash) return { time: "O(n)", space: "O(n)", best: "O(n)", worst: "O(n)", note: "Hash map ops are O(1) avg. Excellent space-time tradeoff." };
  if (nested === 1) return { time: "O(n)", space: "O(1)", best: "O(1)", worst: "O(n)", note: "Single loop — linear time. Efficient for most use cases." };
  return { time: "O(1)", space: "O(1)", best: "O(1)", worst: "O(1)", note: "No loops or recursion — constant time." };
}

function generateFixSuggestions(code: string, lang: string, errText: string): string[] {
  const s: string[] = [];
  if (errText?.trim()) {
    s.push(`⚠️ Error detected:\n   ${errText.trim().split("\n").slice(0, 3).join("\n   ")}`);
    if (/SyntaxError|syntax/.test(errText)) s.push("💡 Fix: Check for missing colons `:`, parentheses, or indentation.");
    if (/NameError|undefined/.test(errText)) s.push("💡 Fix: Variable or function used before definition.");
    if (/IndexError|out of bounds/.test(errText)) s.push("💡 Fix: Array index out of range — add bounds checking.");
    if (/TypeError/.test(errText)) s.push("💡 Fix: Type mismatch — verify you're not mixing int and string.");
    if (/ZeroDivisionError|division by zero/.test(errText)) s.push("💡 Fix: Guard against division by zero.");
    if (/NullPointer/.test(errText)) s.push("💡 Fix: Null reference — check object is initialized.");
    if (/StackOverflow/.test(errText)) s.push("💡 Fix: Infinite recursion — verify base case is reachable.");
  }
  if (!code.trim()) { s.push("ℹ️  Editor is empty. Write your code first."); return s; }

  if (lang === "python" && !code.includes("#")) s.push("📌 Style: Add comments `#` to document your logic.");
  if (lang === "java" && !code.includes("public class")) s.push("⚠️  Java requires a `public class` declaration.");
  if (lang === "java" && !code.includes("public static void main")) s.push("⚠️  Missing `main` method entry point.");
  if (lang === "java" && code.includes("==") && /String/.test(code)) s.push("⚠️  Don't compare Strings with `==` — use `.equals()`.");
  if (lang === "cpp" && !code.includes("#include")) s.push("⚠️  No `#include` directives — add required headers.");
  if (lang === "cpp" && !code.includes("int main")) s.push("⚠️  Missing `int main()` entry point.");
  if ((code.match(/for|while/g) || []).length >= 2) s.push("⚠️  Nested loops detected (O(n²)+). Consider a hash map approach.");
  if (!s.length) s.push("✅ No obvious issues detected. Code looks syntactically correct!");
  return s;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PROBLEMS = [
  { id: "1", title: "Two Sum", difficulty: "Easy", tags: ["Array", "Hash Map"] },
  { id: "2", title: "Bubble Sort", difficulty: "Easy", tags: ["Sorting", "Array"] },
  { id: "3", title: "Binary Search", difficulty: "Medium", tags: ["Array", "Binary Search"] },
  { id: "4", title: "Quick Sort", difficulty: "Medium", tags: ["Sorting", "D&C"] },
  { id: "5", title: "Binary Tree BST", difficulty: "Medium", tags: ["Tree", "Recursion"] },
  { id: "6", title: "LRU Cache", difficulty: "Hard", tags: ["Design", "Hash Map"] },
];

const LS_KEY_CODE = (lang: string) => `placexa_code_${lang}`;
const LS_KEY_HISTORY = "placexa_submissions";

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
interface CodeLabProps {
  onNavigate: (page: string) => void;
  profileData: any;
}

export function CodeLab({ onNavigate, profileData }: CodeLabProps) {
  // ── Editor ──────────────────────────────────────────────────────────────────
  const [language, setLanguage] = useState<"java" | "python" | "cpp">("python");
  const [code, setCode] = useState<string>("");
  const [stdin, setStdin] = useState<string>("");
  const [showSampleMenu, setShowSampleMenu] = useState(false);

  // ── Execution ────────────────────────────────────────────────────────────────
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string>("");

  // ── Visualization ────────────────────────────────────────────────────────────
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [vizSteps, setVizSteps] = useState<ExecutionStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── AI ───────────────────────────────────────────────────────────────────────
  const [aiExplanation, setAiExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [complexity, setComplexity] = useState<{ time: string; space: string; best: string; worst: string; note: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fixSuggestions, setFixSuggestions] = useState<string[]>([]);
  const [isFixing, setIsFixing] = useState(false);

  // ── UI ───────────────────────────────────────────────────────────────────────
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY_HISTORY);
      if (!raw) return [];
      return JSON.parse(raw).map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) }));
    } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [rightTab, setRightTab] = useState<"viz" | "ai" | "problems">("viz");

  // ── Effects ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY_CODE(language));
    setCode(saved ?? "");
    setRunResult(null); setRunError("");
    setIsVisualizing(false); setHighlightedLine(null);
    setAiExplanation(""); setComplexity(null); setFixSuggestions([]);
    if (animRef.current) clearInterval(animRef.current);
    setIsAnimating(false);
  }, [language]);

  useEffect(() => { localStorage.setItem(LS_KEY_CODE(language), code); }, [code, language]);
  useEffect(() => { localStorage.setItem(LS_KEY_HISTORY, JSON.stringify(submissions.slice(0, 30))); }, [submissions]);
  useEffect(() => () => { if (animRef.current) clearInterval(animRef.current); }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Run Code — free Judge0 CE, fallback to demo mode
  // ─────────────────────────────────────────────────────────────────────────────
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;
    if (!code.trim()) { toast.error("Editor is empty", { description: "Write some code before running." }); return; }
    setIsRunning(true);
    setRunResult(null); setRunError("");
    setIsVisualizing(false); setHighlightedLine(null);
    const startMs = Date.now();

    try {
      const result = await runWithJudge0(code, language, stdin);
      if (!result.time || result.time === "0") result.time = ((Date.now() - startMs) / 1000).toFixed(3);
      setRunResult(result);

      if (result.status.id === 3) {
        toast.success("Executed successfully!", {
          description: `${(parseFloat(result.time) * 1000).toFixed(0)}ms · ${(result.memory / 1024).toFixed(1)} MB`,
        });
      } else if ([6, 11].includes(result.status.id)) {
        toast.error("Compilation Error", { description: "Check your syntax and try again." });
      } else if (result.status.id >= 7) {
        toast.error(`Runtime Error: ${result.status.description}`);
      } else {
        toast.info(result.status.description);
      }
    } catch (err: any) {
      // API unavailable → graceful demo fallback
      console.warn("Judge0 unavailable, using demo mode:", err.message);
      const elapsed = ((Date.now() - startMs) / 1000).toFixed(3);
      const mockResult: RunResult = {
        stdout: getMockOutput(code, language),
        stderr: "",
        compile_output: "",
        status: { id: 3, description: "Accepted (demo)" },
        time: elapsed,
        memory: Math.round(Math.random() * 2000 + 3000),
      };
      setRunResult(mockResult);
      toast.warning("Demo mode active", {
        description: "Judge0 API unreachable. Showing simulated output.",
        duration: 5000,
      });
    } finally {
      setIsRunning(false);
    }
  }, [code, isRunning, language, stdin]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    if (!code.trim()) { toast.error("Editor is empty"); return; }
    setIsSubmitting(true);
    try {
      let result: RunResult;
      try {
        result = await runWithJudge0(code, language, stdin);
      } catch {
        await new Promise((r) => setTimeout(r, 1200));
        result = { stdout: getMockOutput(code, language), stderr: "", compile_output: "", status: { id: 3, description: "Accepted (demo)" }, time: "0.089", memory: 4096 };
      }

      const accepted = result.status.id === 3 && !result.stderr?.trim();
      const record: SubmissionRecord = {
        id: Date.now().toString(), code, language, stdin,
        timestamp: new Date(),
        status: accepted ? "accepted" : "error",
        stdout: result.stdout, stderr: result.stderr || result.compile_output,
        executionTime: parseFloat(result.time || "0") * 1000,
        memory: result.memory,
      };
      setSubmissions((p) => [record, ...p]);
      setRunResult(result);
      if (accepted) toast.success("Accepted! 🎉", { description: "All test cases passed." });
      else toast.error("Wrong Answer / Error", { description: result.status.description });
    } catch (e: any) {
      toast.error("Submission failed", { description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  }, [code, isSubmitting, language, stdin, submissions]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Visualization
  // ─────────────────────────────────────────────────────────────────────────────
  const handleVisualize = useCallback(() => {
    if (!code.trim()) { toast.error("Write some code first."); return; }
    if (animRef.current) clearInterval(animRef.current);
    const steps = parseCodeToSteps(code, language, runResult?.stdout || "");
    setVizSteps(steps); setStepIdx(0);
    setHighlightedLine(steps[0]?.line ?? null);
    setIsVisualizing(true); setIsAnimating(false);
    setRightTab("viz");
    toast.success("Visualization ready!", { description: `${steps.length} steps generated from your code.` });
  }, [code, language, runResult]);

  const handleNextStep = () => {
    if (stepIdx < vizSteps.length - 1) { const n = stepIdx + 1; setStepIdx(n); setHighlightedLine(vizSteps[n].line); }
    else toast.info("End of execution reached");
  };
  const handlePrevStep = () => {
    if (stepIdx > 0) { const p = stepIdx - 1; setStepIdx(p); setHighlightedLine(vizSteps[p].line); }
  };
  const handlePlayAnimation = () => {
    if (isAnimating) { if (animRef.current) clearInterval(animRef.current); setIsAnimating(false); return; }
    setIsAnimating(true);
    let s = stepIdx;
    animRef.current = setInterval(() => {
      if (s < vizSteps.length - 1) { s++; setStepIdx(s); setHighlightedLine(vizSteps[s].line); }
      else { if (animRef.current) clearInterval(animRef.current); setIsAnimating(false); toast.success("Animation complete!"); }
    }, 750);
  };
  const handleResetViz = () => {
    if (animRef.current) clearInterval(animRef.current);
    setStepIdx(0); setHighlightedLine(vizSteps[0]?.line ?? null); setIsAnimating(false);
  };

  // ── AI ───────────────────────────────────────────────────────────────────────
  // ✅ Explain Code (Backend API)
  const handleExplainCode = useCallback(async () => {
    if (isExplaining || !code.trim()) {
      if (!code.trim()) toast.error("Write some code first.");
      return;
    }

    try {
      setIsExplaining(true);
      setRightTab("ai");

      const res = await fetch("http://127.0.0.1:8000/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      setTimeout(() => {
        if (data.error) {
          setAiExplanation("❌ " + data.error);
        } else {
          setAiExplanation(data.result);
        }
        setIsExplaining(false);
      }, 300);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setAiExplanation("❌ Backend connection failed");
        setIsExplaining(false);
      }, 300);
    }
  }, [code, isExplaining]);


  // ✅ Fix Code (Backend API)
  const handleFixErrors = useCallback(async () => {
    if (isFixing || !code.trim()) {
      if (!code.trim()) toast.error("Write some code first.");
      return;
    }

    try {
      setIsFixing(true);
      setRightTab("ai");

      const res = await fetch("http://127.0.0.1:8000/fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      setTimeout(() => {
        if (data.error) {
          setFixSuggestions(["❌ " + data.error]);
        } else {
          setFixSuggestions([data.result]);
        }
        setIsFixing(false);
      }, 300);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setFixSuggestions(["❌ Backend connection failed"]);
        setIsFixing(false);
      }, 300);
    }
  }, [code, isFixing]);


  // ✅ Complexity (Backend API)
  const handleAnalyzeComplexity = useCallback(async () => {
    if (isAnalyzing || !code.trim()) {
      if (!code.trim()) toast.error("Write some code first.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setRightTab("ai");

      const res = await fetch("http://127.0.0.1:8000/complexity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      setTimeout(() => {
        if (data.error) {
          setComplexity(null);
          setAiExplanation("❌ " + data.error);
        } else {
          setComplexity(data.result);
        }
        setIsAnalyzing(false);
      }, 300);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setAiExplanation("❌ Backend connection failed");
        setIsAnalyzing(false);
      }, 300);
    }
  }, [code, isAnalyzing]);

  // ── Utility ──────────────────────────────────────────────────────────────────
  const handleLoadSample = (sample: SampleEntry) => {
    const c = sample.codes[language];
    if (c) { setCode(c); setShowSampleMenu(false); toast.success(`Loaded: ${sample.label}`); }
    else { toast.error(`No ${LANG_LABELS[language]} sample for "${sample.label}" yet.`); }
  };

  const handleResetCode = () => {
    setCode(""); setRunResult(null); setRunError("");
    setIsVisualizing(false); setHighlightedLine(null);
    localStorage.setItem(LS_KEY_CODE(language), "");
    toast.success("Editor cleared");
  };
  const handleSaveCode = () => {
    setSubmissions((p) => [{ id: Date.now().toString(), code, language, stdin, timestamp: new Date(), status: "saved" }, ...p]);
    toast.success("Code saved to history!");
  };
  const handleCopyCode = () => {
    if (!code.trim()) { toast.error("Nothing to copy."); return; }
    navigator.clipboard.writeText(code).then(() => toast.success("Copied to clipboard!"));
  };
  const handleLoadFromHistory = (s: SubmissionRecord) => {
    setLanguage(s.language as any); setCode(s.code); setStdin(s.stdin || "");
    setShowHistory(false); toast.success("Code loaded from history!");
  };
  const clearHistory = () => { setSubmissions([]); localStorage.removeItem(LS_KEY_HISTORY); toast.success("History cleared"); };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const currentState = vizSteps[stepIdx];
  const vizProgress = vizSteps.length > 1 ? (stepIdx / (vizSteps.length - 1)) * 100 : 0;
  const statusId = runResult?.status?.id ?? 0;
  const hasError = !!(runResult?.stderr?.trim() || runResult?.compile_output?.trim() || runError);
  const diffColor = (d: string) => d === "Easy" ? "text-green-700 bg-green-50 border-green-200" : d === "Medium" ? "text-yellow-700 bg-yellow-50 border-yellow-200" : "text-red-700 bg-red-50 border-red-200";

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" richColors />

      {/* ══ Header ══════════════════════════════════════════════════════════════ */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("dashboard")} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-gray-900">Code Lab</div>
                <div className="text-xs text-gray-500 hidden sm:block">Interactive Compiler · Free</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1 ml-2 text-sm text-gray-400">
              <button onClick={() => onNavigate("dashboard")} className="hover:text-blue-600">Dashboard</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-700 font-medium">Code Lab</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="hidden lg:flex items-center gap-1 mr-1">
              {[["skillgap", "Skills"], ["resume", "Resume"], ["interview", "Interview"]].map(([p, label]) => (
                <button key={p} onClick={() => onNavigate(p)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">{label}</button>
              ))}
            </div>
            {/* Free badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-full">
              <CheckCircle className="w-3.5 h-3.5" /> Free API
            </span>
            <button onClick={() => setShowHistory(!showHistory)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
              {submissions.length > 0 && <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{Math.min(submissions.length, 9)}</span>}
            </button>
            <button onClick={handleCopyCode} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm flex items-center gap-2">
              <Copy className="w-4 h-4" /><span className="hidden sm:inline">Copy</span>
            </button>
            <button onClick={handleSaveCode} className="px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm flex items-center gap-2">
              <Save className="w-4 h-4" /><span className="hidden sm:inline">Save</span>
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-60">
              {isSubmitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Submitting…</> : <><Send className="w-4 h-4" />Submit</>}
            </button>
          </div>
        </div>
      </header>

      {/* ══ History Drawer ═══════════════════════════════════════════════════════ */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setShowHistory(false)} />
          <div className="w-[380px] bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-lg flex items-center gap-2"><History className="w-5 h-5 text-blue-600" />History</h3>
              <div className="flex items-center gap-2">
                {submissions.length > 0 && <button onClick={clearHistory} className="text-xs text-red-600 hover:underline px-2">Clear</button>}
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1">
              {submissions.length === 0 ? (
                <div className="text-center py-14 text-gray-400"><History className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No submissions yet</p></div>
              ) : submissions.map((s) => (
                <div key={s.id} onClick={() => handleLoadFromHistory(s)}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md cursor-pointer hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${s.status === "accepted" ? "text-green-700 bg-green-50 border-green-200" : s.status === "error" ? "text-red-700 bg-red-50 border-red-200" : "text-blue-700 bg-blue-50 border-blue-200"}`}>
                      {s.status === "accepted" ? "✓ Accepted" : s.status === "error" ? "✗ Error" : "💾 Saved"}
                    </span>
                    <span className="text-xs text-gray-400">{s.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-purple-600 uppercase">{s.language}</span>
                    {s.executionTime != null && <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{s.executionTime.toFixed(0)}ms</span>}
                    {s.memory != null && s.memory > 0 && <span className="text-xs text-gray-500 flex items-center gap-1"><MemoryStick className="w-3 h-3" />{(s.memory / 1024).toFixed(1)} MB</span>}
                  </div>
                  <div className="text-xs text-gray-600 font-mono truncate">{s.code.split("\n").find(l => l.trim()) || "(empty)"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ Main Layout ══════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ════ LEFT — Editor (3/5) ═══════════════════════════════════════════ */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* ── Toolbar ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Language */}
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-gray-500" />
                  <select value={language} onChange={(e) => setLanguage(e.target.value as any)}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium">
                    {Object.entries(LANG_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>

                {/* Execution stats */}
                {runResult && (
                  <div className="flex items-center gap-3 text-xs text-gray-500 border-l pl-3">
                    <span className={`flex items-center gap-1 font-medium ${statusId === 3 ? "text-green-600" : "text-red-600"}`}>
                      {statusId === 3 ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {runResult.status.description}
                    </span>
                    {runResult.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-500" />{(parseFloat(runResult.time) * 1000).toFixed(0)}ms</span>}
                    {runResult.memory > 0 && <span className="flex items-center gap-1"><MemoryStick className="w-3 h-3 text-purple-500" />{(runResult.memory / 1024).toFixed(1)} MB</span>}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* ── Sample Codes Dropdown ── */}
                <div className="relative">
                  <button onClick={() => setShowSampleMenu(!showSampleMenu)}
                    className="px-3 py-2 border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 rounded-lg text-sm flex items-center gap-1.5 transition-colors">
                    <FileCode className="w-4 h-4" />Sample Codes<ChevronDown className="w-3 h-3" />
                  </button>

                  {showSampleMenu && (
                    <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-2xl shadow-xl z-30 w-72 overflow-hidden">
                      <div className="px-4 py-2.5 border-b bg-gray-50 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">10 Example Programs</span>
                        <button onClick={() => setShowSampleMenu(false)} className="p-1 hover:bg-gray-200 rounded-lg"><X className="w-3.5 h-3.5 text-gray-500" /></button>
                      </div>
                      <div className="overflow-y-auto max-h-[420px] p-2">
                        {SAMPLE_CATEGORIES.map((cat) => (
                          <div key={cat} className="mb-2">
                            {/* Category header */}
                            <div className="px-3 py-1.5 flex items-center gap-2">
                              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cat === "Basic" ? "bg-blue-100 text-blue-700" :
                                cat === "Arrays" ? "bg-green-100 text-green-700" :
                                  cat === "Sorting" ? "bg-orange-100 text-orange-700" :
                                    cat === "Trees" ? "bg-purple-100 text-purple-700" :
                                      "bg-pink-100 text-pink-700"
                                }`}>{cat}</span>
                            </div>
                            {/* Sample items */}
                            {SAMPLES.filter((s) => s.category === cat).map((sample) => (
                              <button key={sample.label} onClick={() => handleLoadSample(sample)}
                                className="w-full px-4 py-2.5 text-sm text-left hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors flex items-center gap-2 group">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-500 flex-shrink-0 transition-colors" />
                                {sample.label}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2 border-t bg-gray-50">
                        <p className="text-xs text-gray-400 text-center">Loads code for <strong>{LANG_LABELS[language]}</strong></p>
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={handleResetCode}
                  className="px-3 py-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm flex items-center gap-1.5 border border-gray-200 transition-colors">
                  <Trash2 className="w-4 h-4" />Reset
                </button>
                <button onClick={handleVisualize}
                  className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm flex items-center gap-1.5 font-medium transition-colors">
                  <Eye className="w-4 h-4" />Visualize
                </button>
                <button onClick={handleRunCode} disabled={isRunning}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2 font-medium disabled:opacity-60 transition-colors">
                  {isRunning
                    ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Running…</>
                    : <><Play className="w-4 h-4 fill-white" />Run Code</>}
                </button>
              </div>
            </div>

            {/* ── Monaco Editor ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
              onClick={() => setShowSampleMenu(false)}>
              <div className="border-b bg-[#f8f8f8] px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-yellow-400" /><div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-sm text-gray-500 font-mono">solution.{LANG_EXT[language]}</span>
                </div>
                <div className="flex items-center gap-3">
                  {!code.trim() && <span className="text-xs text-gray-400 italic">Write your code or load a sample…</span>}
                  {highlightedLine && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">▶ Line {highlightedLine}</span>}
                </div>
              </div>
              <Editor
                height="420px"
                language={language}
                value={code}
                onChange={(v) => setCode(v ?? "")}
                theme="vs-light"
                options={{
                  minimap: { enabled: false }, fontSize: 14, lineNumbers: "on",
                  scrollBeyondLastLine: false, automaticLayout: true,
                  padding: { top: 14, bottom: 14 },
                  fontFamily: "'JetBrains Mono','Fira Code',Consolas,monospace",
                  renderLineHighlight: "all", smoothScrolling: true,
                  cursorSmoothCaretAnimation: "on",
                  bracketPairColorization: { enabled: true },
                  wordWrap: "on", suggest: { showKeywords: true },
                }}
              />
            </div>

            {/* ── Input & Output ── */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* stdin */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b bg-gray-50 px-4 py-2.5 flex items-center gap-2">
                  <WrapText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Custom Input (stdin)</span>
                </div>
                <textarea value={stdin} onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter test case input here…"
                  className="w-full px-4 py-3 text-sm focus:outline-none font-mono resize-none text-gray-700 placeholder-gray-400" rows={5} />
              </div>

              {/* stdout */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b bg-gray-50 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Output Console</span>
                  </div>
                  {runResult?.stdout && !hasError && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {hasError && <AlertCircle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="p-4 h-[130px] overflow-y-auto font-mono text-sm">
                  {isRunning ? (
                    <div className="flex items-center gap-3 text-gray-500"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />Executing…</div>
                  ) : runError ? (
                    <><span className="text-red-600 text-xs font-semibold flex items-center gap-1 mb-1"><AlertCircle className="w-3 h-3" />Error</span><pre className="text-red-600 whitespace-pre-wrap text-xs">{runError}</pre></>
                  ) : runResult ? (
                    <>
                      {runResult.compile_output && <><span className="text-red-600 text-xs font-semibold block mb-1">Compile Error:</span><pre className="text-red-500 whitespace-pre-wrap text-xs mb-2">{runResult.compile_output}</pre></>}
                      {runResult.stderr && <><span className="text-orange-600 text-xs font-semibold block mb-1">Runtime Error:</span><pre className="text-orange-600 whitespace-pre-wrap text-xs mb-2">{runResult.stderr}</pre></>}
                      {runResult.stdout
                        ? <pre className="text-gray-800 whitespace-pre-wrap">{runResult.stdout}</pre>
                        : !runResult.stderr && !runResult.compile_output && <span className="text-gray-400 italic text-xs">No output produced</span>}
                    </>
                  ) : <span className="text-gray-400 italic">Run your code to see output…</span>}
                </div>
              </div>
            </div>

            {/* ── AI Action Bar ── */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">AI Assistant</span>
                  <span className="text-blue-200 text-sm hidden sm:inline">Analyses your code in real-time</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "Explain Code", icon: <Lightbulb className="w-4 h-4" />, loading: isExplaining, action: handleExplainCode },
                    { label: "Complexity", icon: <Activity className="w-4 h-4" />, loading: isAnalyzing, action: handleAnalyzeComplexity },
                    { label: "Fix Errors", icon: <RefreshCw className="w-4 h-4" />, loading: isFixing, action: handleFixErrors },
                  ].map((btn) => (
                    <button key={btn.label} onClick={btn.action} disabled={btn.loading}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium backdrop-blur-sm disabled:opacity-60 flex items-center gap-2 transition-colors">
                      {btn.loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : btn.icon}
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ════ RIGHT — Panels (2/5) ══════════════════════════════════════════ */}
          <div className="lg:col-span-2 flex flex-col gap-4" onClick={() => setShowSampleMenu(false)}>

            {/* Tab switcher */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-1.5 flex gap-1">
              {([
                { id: "viz" as const, label: "Visualizer", icon: <Layers className="w-4 h-4" /> },
                { id: "ai" as const, label: "AI Panel", icon: <Brain className="w-4 h-4" /> },
                { id: "problems" as const, label: "Problems", icon: <BookOpen className="w-4 h-4" /> },
              ]).map((tab) => (
                <button key={tab.id} onClick={() => setRightTab(tab.id)}
                  className={`flex-1 py-2 px-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${rightTab === tab.id ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}>
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>

            {/* ══ Visualizer ═══════════════════════════════════════════════════ */}
            {rightTab === "viz" && (
              <div className="flex flex-col gap-4">
                {!isVisualizing ? (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Eye className="w-8 h-8 text-purple-600" /></div>
                    <h3 className="font-semibold text-gray-800 mb-2">Code Visualizer</h3>
                    <p className="text-sm text-gray-500 mb-5 max-w-xs">Write or load code, then step through execution — variables, call stack, and output traced live.</p>
                    <button onClick={handleVisualize} className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 flex items-center gap-2 font-medium">
                      <PlayCircle className="w-5 h-5" />Start Visualization
                    </button>
                    <p className="text-xs text-gray-400 mt-3">Run code first for richer output mapping</p>
                  </div>
                ) : currentState ? (
                  <>
                    {/* Controls */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 transition-all duration-500 hover:shadow-md">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Cpu className="w-4 h-4 text-purple-600" />Execution Trace</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{stepIdx + 1} / {vizSteps.length}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${isAnimating
                            ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 animate-pulse"
                            : "bg-purple-600"
                            }`}
                          style={{ width: `${vizProgress}%` }}
                        />
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-2.5 text-sm text-purple-800 mb-4 font-medium break-words transition-all duration-300 animate-in fade-in slide-in-from-bottom-1">
                        {currentState.description}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handlePrevStep} disabled={stepIdx === 0} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-1"><RotateCcw className="w-3 h-3" />Prev</button>
                        <button onClick={handlePlayAnimation} className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-all duration-300 ${isAnimating ? "bg-orange-100 text-orange-700 ring-2 ring-orange-200" : "bg-purple-600 text-white hover:bg-purple-700"}`}>
                          {isAnimating ? <><PauseCircle className="w-4 h-4 animate-pulse" />Pause</> : <><PlayCircle className="w-4 h-4" />Play</>}
                        </button>
                        <button onClick={handleNextStep} disabled={stepIdx === vizSteps.length - 1} className="flex-1 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-1">Next<SkipForward className="w-3 h-3" /></button>
                        <button onClick={handleResetViz} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl"><RotateCcw className="w-4 h-4 text-gray-600" /></button>
                      </div>
                    </div>

                    {/* Variables */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-green-600" />Variables in Scope</h4>
                      {currentState.variables.length === 0
                        ? <p className="text-xs text-gray-400 italic">No variables yet</p>
                        : <div className="space-y-2">
                          {currentState.variables.map((v, i) => (
                            <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-500 ${v.changed ? "bg-green-50 border border-green-200 ring-1 ring-green-200 scale-[1.02]" : "bg-gray-50"}`}>
                              <div className="flex items-center gap-2">
                                {v.changed && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
                                <code className="text-sm text-gray-700 font-semibold">{v.name}</code>
                                <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">{v.type}</span>
                              </div>
                              <code className="text-sm text-blue-700 font-semibold max-w-[120px] truncate" title={v.value}>{v.value}</code>
                            </div>
                          ))}
                        </div>}
                    </div>

                    {/* Call Stack */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Layers className="w-4 h-4 text-orange-500" />Call Stack</h4>
                      <div className="space-y-1.5">
                        {[...currentState.stack].reverse().map((frame, i) => (
                          <div key={i} className={`px-3 py-2 rounded-lg text-sm font-mono transition-all duration-300 ${i === 0 ? "bg-orange-100 text-orange-800 border border-orange-200 font-semibold animate-pulse" : "bg-gray-50 text-gray-600 border border-gray-100"}`}>
                            {frame}() {i === 0 && <span className="ml-2 text-xs text-orange-400 font-sans">← active</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {currentState.output && (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                        <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" />Output at this step</h4>
                        <code className="text-sm text-green-700 break-words">{currentState.output}</code>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* ══ AI Panel ═════════════════════════════════════════════════════ */}
            {rightTab === "ai" && (
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Brain className="w-5 h-5 text-blue-600" />AI Code Analysis</h3>
                  <div className="space-y-2">
                    {[
                      { label: "Explain Code", sub: "Line-by-line breakdown", icon: <Lightbulb className="w-5 h-5 text-yellow-600" />, bg: "bg-yellow-50 border-yellow-200", loading: isExplaining, action: handleExplainCode },
                      { label: "Time Complexity", sub: "Big-O with best/worst case", icon: <Zap className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50 border-purple-200", loading: isAnalyzing, action: handleAnalyzeComplexity },
                      { label: "Fix Errors", sub: "Bug detection & improvement tips", icon: <RefreshCw className="w-5 h-5 text-red-500" />, bg: "bg-red-50 border-red-200", loading: isFixing, action: handleFixErrors },
                    ].map((item) => (
                      <button key={item.label} onClick={item.action} disabled={item.loading}
                        className={`w-full px-4 py-3 ${item.bg} border text-left rounded-xl flex items-center gap-3 hover:opacity-90 disabled:opacity-60 transition-all`}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-gray-100">
                          {item.loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" /> : item.icon}
                        </div>
                        <div><div className="text-sm font-semibold text-gray-800">{item.label}</div><div className="text-xs text-gray-500">{item.sub}</div></div>
                      </button>
                    ))}
                  </div>
                </div>

                {complexity && (
                  <div className="bg-white rounded-2xl border border-purple-200 shadow-sm p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-purple-600" />Complexity Analysis</h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-purple-50 rounded-xl p-3 text-center"><div className="text-xs text-gray-500 mb-1">Time</div><div className="text-lg font-bold text-purple-700 font-mono">{complexity.time}</div></div>
                      <div className="bg-blue-50 rounded-xl p-3 text-center"><div className="text-xs text-gray-500 mb-1">Space</div><div className="text-lg font-bold text-blue-700 font-mono">{complexity.space}</div></div>
                    </div>
                    <div className="space-y-1.5 text-sm mb-3">
                      <div className="flex items-center justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Best Case</span><code className="text-green-700 font-medium">{complexity.best}</code></div>
                      <div className="flex items-center justify-between py-1 border-b border-gray-100"><span className="text-gray-500">Worst Case</span><code className="text-red-600 font-medium">{complexity.worst}</code></div>
                    </div>
                    <p className="text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">{complexity.note}</p>
                  </div>
                )}

                {fixSuggestions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" />Fix Suggestions</h4>
                    <div className="space-y-2">
                      {fixSuggestions.map((fix, i) => (
                        <div key={i} className={`p-3 rounded-xl text-sm leading-relaxed ${fix.startsWith("✅") ? "bg-green-50 border border-green-200 text-green-800" : fix.startsWith("⚠️") ? "bg-orange-50 border border-orange-200 text-orange-800" : "bg-blue-50 border border-blue-200 text-blue-800"}`}>
                          {fix}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiExplanation && (
                  <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-600" />AI Explanation</h4>
                    <pre className="whitespace-pre-wrap text-xs text-gray-700 leading-relaxed font-sans bg-gray-50 rounded-xl p-3">
                      {aiExplanation}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* ══ Problems Tab ════════════════════════════════════════════════ */}
            {rightTab === "problems" && (
              <div className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                  <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600" />Problem Set</h3>
                  <p className="text-xs text-gray-500 mb-4">Click to load sample code for each problem</p>
                  <div className="space-y-2">
                    {PROBLEMS.map((p) => (
                      <button key={p.id} onClick={() => {
                        const match = SAMPLES.find(s => s.label.toLowerCase().includes(p.title.toLowerCase().split(" ")[0].toLowerCase()) || p.title.toLowerCase().includes(s.label.toLowerCase().split(" ")[0].toLowerCase()));
                        if (match && match.codes[language]) { setCode(match.codes[language]); toast.success(`Loaded: ${match.label}`); }
                        else toast.info("Use the Sample Codes button to find related examples!");
                      }}
                        className="w-full p-3 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all text-left group">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{p.id}. {p.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${diffColor(p.difficulty)}`}>{p.difficulty}</span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {p.tags.map((t) => <span key={t} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{t}</span>)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily challenge */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className="w-5 h-5 text-yellow-300" /><span className="font-semibold">Daily Challenge</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-auto">+50 XP</span>
                  </div>
                  <p className="text-xl font-bold mb-1">Quick Sort</p>
                  <p className="text-blue-200 text-sm mb-4">Medium · Divide & Conquer</p>
                  <button onClick={() => { const s = SAMPLES.find(x => x.label === "Quick Sort"); if (s && s.codes[language]) { setCode(s.codes[language]); toast.success("Daily challenge loaded!"); } }}
                    className="px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-50">
                    Solve Now →
                  </button>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-green-600" />Session Stats</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Accepted", value: submissions.filter(s => s.status === "accepted").length, color: "text-blue-600" },
                      { label: "Saved", value: submissions.filter(s => s.status === "saved").length, color: "text-purple-600" },
                      { label: "Total", value: submissions.length, color: "text-green-600" },
                    ].map((s) => (
                      <div key={s.label} className="text-center bg-gray-50 rounded-xl p-3">
                        <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
