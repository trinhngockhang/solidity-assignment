# Capped Set contract

## How to run

Install dependencies

`npm i`

Run test

`npm run test`
## How did I approach and handle this problem
The requirement of this challenge is how to save many pair of address-uint (key-value) into a structure that we can easily pop out the lowest value (each function).

The simplest solution is everytime we have new elements we can check if it is the lowest value and save it as a variable.

But if we update lowest value or remove it, we have to find the next lowest element by sort all of value to find it. That could be disaster when we have million of elements, right? 

So I need to save all of element by a structure that would easy to find the lowest value and not too complicated when insert. So i use Red Black Tree to do that, a structure that can rebalance the tree. So in the worst case, resulting in Olog(n).Saving a lot of gas.
