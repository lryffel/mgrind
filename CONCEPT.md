# mgrind

mgrind is a static web app written with Svelte and Typescript that lets students study math. It is available in English and in German.

Exercises are randomly generated and come in multiple types.

## Disciplines

There are multiple disciplines like

- Multiplication tables
- Fractions
- Linear equations

Each discipline has multiple exercise types that need to be mastered for the discipline to be mastered.

When a discipline is selected, a random exercise type in the discipline is chosen.

## Exercise Types

Exercise types are programmed individually. Exercise types might belong to multiple disciplines. Example could be

- Evaluating products of numbers
- Differences of fractions without variables
- Solving linear equations in standard form

Each exercise type features a generation function that depends on a random seed as well as a given complexity. The complexity comes in discrete steps and the number of possible complexities differs for each exercise type.

### Complexity

Complexity can arise in a variety of ways. One way is obvious: more annoying numbers. Multiplying two two-digit numbers usually takes 3 multiplications and one addition. For example, consider the multiplication 12 * 34. A typical student might argue

- 12 * 30 is ... I don't know that by heart. Let's split it up.
- 10 * 30 is 300.
- 2 * 30 is 60.
- So 12 * 30 is 300 + 60 = 360.
- Now we need to add 12 * 4.
- I can't do this directly either. This is 10 * 4 + 2 * 4 = 40 + 8 = 48.
- Thus, the total is 12 * 30 + 12 * 4 = 360 + 48 = 408.

This computation is high complexity in this app: if a problem, once mastered, is harder than multiplying two two-digit integers then it is maximum complexity.

## Progress

The progress of an exercise type is given as the current complexity divided by the maximum complexity, adjusted so that it ranges from 0 to 1. I the user manages to solve an exercise, the exercise's complexity goes up. If they fail, it goes down. The progress of a discipline is the average of all progresses of the exercise types in the discipline, displayed to the user in percent.
