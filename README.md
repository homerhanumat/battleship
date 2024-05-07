# Welcome to Battleship!

## Brought to You By ...

**Battleship** is a collaborative project of the members of CSC 470 *Topics in Computer Science:  Javascript Dev Lab*, taught in Spring 2024 at Georgetown College in Kentucky, USA.  Collaborators are:

* Halie Bohn
* Caden Cummins
* Isaac Morris
* Samuel Steyn
* Sean Switzer
* Rhys Tilford
* Kai Totsuka
* Homer White (instructor)

The aim is to build an entertaiing version of the game Battleship as a way of learning JavaScript and software development principles.

## How to Play

Follow the link at the upper right of this Github repository.  Yu will be taken to a splash page.  Press the Play button.

You will see two blue oceans.  The lower ocean belongs to you; the upper ocean is the enemy's (the computer's) territory.  Both you and the computer have three ships:

* A battleship (largest).  This ship needs 5 or more units of damage to be sunk.
* A cruiser.  Crusiers sink when they receive 3 or more damage-units.
* A destroyer (smallest).  two or more units of damge will sink this ship.

You can see your own ships.  You cannot a ship belonging to the computer until you sink that ship.

You and the computer will take turns dropping bombs on each other's territory.  You will go first.

You can drop a bomb when you see a white circle following your mouse over the ocean area.  Clicking on the ocean causes a bomb to be dropped at the point where you clicked.  The bomb damages any enemy ship that happens to lie in the surrounding circle.

There are two buttons outside the ocean-area.  One shows a menu of options, as well as a report fo the damge done so far to the ships of both players.  The other button brings up a slider that can use to set the power of the bomb, i.e., the number of units of damage that it inflicts on any ship within its radius of lethality.  The higher you set the damage-level, the smaller the radius of lethality.

You will receive a report of what, if anything, you hit after each shot.

We suggest starting with a large radius (low damage) to search for ships.  Once you locate a ship, use the slider to increase the power of your bombs, and then drop bombs within the area where you know the ship lies until the ship is sunk.  Then switch to a maximum-radius search of new areas of the computer's ocean.

The first player to sink all of the opposing ships wins the game.  To play again, press the refresh button on your browser.

Have fun!

## Note on Development

**Battleship** is under active development.  Some links and buttons (especially in the menu area) do not yet perform a function.  Please forgive the clunky styling:  we are working on it!  Also, for now don't try to play the game on a smart phone or other narrow device.