# How the Yahtzee Trainer works

The pictures on this page are screenshots from the app’s automatic tests (`e2e/anleitung.e2e.ts`). This is what the app really looks like. When the look changes, the tests run again and replace the pictures.

[Deutsch](anleitung.md)

## 1. Choose the game

You open the mode you want: explain mode, game with joker or plain game. Then you choose the upper half (6 rounds) or the whole sheet (13 rounds).

![The start view with two buttons: upper half and whole sheet.](anleitung/img/1-start-desktop.png)

## 2. The coach goes along with you

In explain mode you throw the dice and decide yourself which to keep. The coach does not tell you what to do. It works with the dice you keep: three chances as a ring with percent and as a fraction, and an overview of how often which points come out if you play the position 100 times. The average of these 100 tries is the “on average”. As long as you keep nothing, the coach says so and waits.

![Five dice, none kept yet. The coach says it works with the dice you keep.](anleitung/img/2a-coach-nichts-gehalten-desktop.png)

![Five dice, three fours are kept. On the right the coach with three rings (31, 52 and 9 percent) and bars: 48 times of 100 you end with 12 points, 42 times with 16, 9 times with 20.](anleitung/img/2-coach-chancen-desktop.png)

## 3. How it works: the tree

Under “How it works” you see how the chance comes about. Each branch shows its chance, the end of each way the product. The green ways have at least one 4. You add them up or take the opposite.

![A probability tree with two dice. The branches show 1/6 and 5/6, the ends of the ways 1/36, 5/36, 5/36 and 25/36.](anleitung/img/3-coach-baum-desktop.png)

## 4. With two throws

In the second step you work out two throws: first no 4 twice in a row, then the opposite.

![The calculation 25/36 times 25/36 equals 625/1296 and the opposite 671/1296, about 52 percent.](anleitung/img/4-coach-zwei-wuerfe-desktop.png)

## 5. The joker: empty tree

In the game with joker you play yourself. When you are stuck, ask the joker. On level 1 the tree is empty: you enter how likely each branch is.

![A tree with question marks at its branches and ways, with two input fields below.](anleitung/img/5-joker-1-leer-desktop.png)

## 6. Entered correctly

When your fraction is right, the branch is shown in the tree.

![The branches for a 4 and for no 4 are shown, the ways still show question marks.](anleitung/img/6-joker-1-ausgefuellt-desktop.png)

## 7. Level 2: the ways

On level 2 the branches are filled in. You work out one way (times) and add up the green ways.

![The tree with filled-in branches. Below, input fields for one way and for the sum of the green ways.](anleitung/img/7-joker-2-aeste-desktop.png)

## 8. Level 3: the solution

On level 3 you see the solution and the tip which dice you could keep and which field they aim for, with bars of how often which points come out. It is your choice; the joker is only a help.

![The full tree with results, the sum 11/36 and the yellow tip: keep 4, 4, 4 and aim for fours.](anleitung/img/8-joker-3-loesung-desktop.png)

## 9. Feedback after the move

When you enter a field, the trainer tells you how the move was and what would have been better.

![The score sheet with points entered and a card with feedback on the last move.](anleitung/img/9-rueckmeldung-desktop.png)

## 10. The plain game

In the plain game there is no help. You collect points for the high-score list.

![Dice and score sheet without coach and without joker.](anleitung/img/10-spielen-desktop.png)

## 11. The end

At the end you see your points and the high-score list. It stays on your device and has no names.

![The end view with the points and a high-score list with one entry.](anleitung/img/11-ende-desktop.png)

## On a phone

At 360 pixels wide the view looks like this:

![Five dice, three fours are kept. On the right the coach with three rings (31, 52 and 9 percent) and bars of how the points come out. (On a phone)](anleitung/img/2-coach-chancen-360px.png)

![The full tree with results, the sum 11/36 and the yellow tip: keep 4, 4, 4 and aim for fours. (On a phone)](anleitung/img/8-joker-3-loesung-360px.png)

