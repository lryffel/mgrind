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

## Progress

The progress of an exercise type is given as the current complexity divided by the maximum complexity, adjusted so that it ranges from 0 to 1. I the user manages to solve an exercise, the exercise's complexity goes up. If they fail, it goes down. The progress of a discipline is the average of all progresses of the exercise types in the discipline, displayed to the user in percent.
