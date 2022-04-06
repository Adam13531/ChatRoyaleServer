# ChatRoyaleServer

A battle-royale game played over Twitch chat. This was a fun, one-off game played on April Fool's Day, 2022 ([watch the hour-long video here](https://www.twitch.tv/videos/1443243254)).

## Overview

ChatRoyale consists of three GitHub repos:

- [The chat client](https://github.com/Adam13531/ChatRoyale): this is a fork of [YaTA](https://github.com/HiDeoo/YaTA) ("Yet another Twitch App") that knows to connect to the game server and is aware of the general game rules.
- [The game server](https://github.com/Adam13531/ChatRoyaleServer): this controls the game flow, picks prompts for each round, determines winners/losers, and handles the communication to the clients.
- [The moderation client](https://github.com/Adam13531/ChatRoyaleModerationClient): this is the moderator view into the game. It has approve/reject buttons for each message.

## How to run everything

I am taking a lazy approach to open-sourcing by just putting the code out there. I spent so many hours preparing for April Fool's Day that I don't want to write a full setup guide. 😥 In general, if you're familiar with Node.js and Yarn, it shouldn't be too bad to figure out.

So that I don't leave you _completely_ high and dry, here are some general tips/guidelines:

- Try to use Yarn v1.22.17.
- If you're using Windows, look at [this commit](https://github.com/Adam13531/ChatRoyale/commit/4c2bc0bfcba2fad370d1f8ba3f69cec2f5a7f2e0) in particular. I'm pretty sure I reverted all of that commit when I finally deployed, so you'll need to un-revert it. If possible, just use Linux or macOS.
- Look at [the YaTA `README`](https://github.com/HiDeoo/YaTA) for how to set up a Twitch app.

## Other notes

- I have no plans to maintain this or host it again. I liked the idea of it being a one-off event.
- [@freaktechnik](https://twitter.com/freaktechnik) wrote [this JSFiddle](https://jsfiddle.net/o5nxbrm7/1/) for connecting to the game server and displaying a live list of players.
- [Here's the instructions document](https://docs.google.com/document/d/1Jza7cr_XaiGphLc3viwTlWUenqLYhbGkgBlcSjbXnjQ/edit) that I shared on the day of.
- Feel free to reach out to me with any questions; you'll find my contact information on my GitHub profile.
