- [x] Fix the spacing of the geometry exercises. The svg has a lot of space on top and even more on the bottom. It's worse for the Pythagoras exercise.
- [x] In the binary fraction exercises, and preferrably everywhere else, render fractions with denominator 1 as just the numerator.
- [x] Render user submitted fractions as display fractions as well, for example in the binary fractions exercise. Also include the rule that negative numerators get the minus in front of the fraction. (now uses \dfrac everywhere + <Math display> for user answers)
- [x] Refactor the exercise about adding fractions so that the computations are much less annoying. Use only powers of 2 and 5 as denominators, with a possible multiple 3. (also applied to subtraction)

- [x] The highlighting of the user's solutions in the factoring equations is not quite right. If the user enters $t_1 = 9, t_2 = 8$ but the solution is $t_1 = -9, t_2 = 9$, 8 is highlighted in the "correct answer" color, and 9 in the "wrong answer" color. It seems to always be inverted
