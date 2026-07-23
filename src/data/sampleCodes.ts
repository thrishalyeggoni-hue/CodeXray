import { SampleCode } from '../types';

export const SAMPLE_CODES: SampleCode[] = [
  {
    id: 'binary-search-java',
    title: 'Binary Search Algorithm',
    language: 'java',
    difficulty: 'Beginner',
    description: 'Efficiently search for a target value in a sorted array in O(log N) time.',
    code: `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;

        while (left <= right) {
            int mid = left + (right - left) / 2;

            if (arr[mid] == target) {
                return mid; // Target found
            }
            if (arr[mid] < target) {
                left = mid + 1; // Search right half
            } else {
                right = mid - 1; // Search left half
            }
        }
        return -1; // Target not found
    }

    public static void main(String[] args) {
        int[] numbers = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
        int target = 23;
        int result = search(numbers, target);
        System.out.println("Found at index: " + result);
    }
}`
  },
  {
    id: 'two-sum-py',
    title: 'Two Sum Problem',
    language: 'python',
    difficulty: 'Beginner',
    description: 'Find two numbers in an array that add up to a specific target using a hash map.',
    code: `def two_sum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []

# Test execution
numbers = [2, 7, 11, 15]
target = 9
result = two_sum(numbers, target)
print(f"Indices: {result}")`
  },
  {
    id: 'quick-sort-cpp',
    title: 'Quick Sort Partitioning',
    language: 'cpp',
    difficulty: 'Intermediate',
    description: 'Divide-and-conquer sorting algorithm using pivot partitioning.',
    code: `#include <iostream>
#include <vector>

int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);

    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return (i + 1);
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    std::vector<int> data = {10, 7, 8, 9, 1, 5};
    quickSort(data, 0, data.size() - 1);
    for (int x : data) std::cout << x << " ";
    return 0;
}`
  },
  {
    id: 'lru-cache-js',
    title: 'LRU Cache Implementation',
    language: 'javascript',
    difficulty: 'Advanced',
    description: 'Least Recently Used Cache using Map for O(1) reads and updates.',
    code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val); // Refresh key position
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest (first key in Map)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

const lru = new LRUCache(2);
lru.put(1, "Data A");
lru.put(2, "Data B");
console.log(lru.get(1)); // Access 1
lru.put(3, "Data C"); // Evicts key 2
console.log(lru.get(2)); // -1 (evicted)`
  },
  {
    id: 'sql-window-fn',
    title: 'SQL Ranking & Window Functions',
    language: 'sql',
    difficulty: 'Intermediate',
    description: 'Rank employees within departments by salary using DENSE_RANK().',
    code: `WITH SalaryRanked AS (
    SELECT 
        e.employee_id,
        e.first_name,
        e.department_id,
        d.department_name,
        e.salary,
        DENSE_RANK() OVER (
            PARTITION BY e.department_id 
            ORDER BY e.salary DESC
        ) as dept_salary_rank
    FROM employees e
    INNER JOIN departments d ON e.department_id = d.department_id
)
SELECT 
    employee_id,
    first_name,
    department_name,
    salary,
    dept_salary_rank
FROM SalaryRanked
WHERE dept_salary_rank <= 3
ORDER BY department_name, dept_salary_rank;`
  },
  {
    id: 'go-concurrency',
    title: 'Go Goroutines & Worker Pool',
    language: 'go',
    difficulty: 'Advanced',
    description: 'Concurrent task processing using Go channels and sync.WaitGroup.',
    code: `package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		fmt.Printf("Worker %d processing job %d\\n", id, j)
		time.Sleep(time.Millisecond * 100)
		results <- j * 2
	}
}

func main() {
	numJobs := 5
	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)

	var wg sync.WaitGroup

	for w := 1; w <= 3; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	for j := 1; j <= numJobs; j++ {
		jobs <- j
	}
	close(jobs)

	wg.Wait()
	close(results)

	for res := range results {
		fmt.Println("Result:", res)
	}
}`
  }
];
