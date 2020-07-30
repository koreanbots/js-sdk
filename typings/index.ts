/// <reference path="index.d.ts" />

import Koreanbots from "koreanbots"
import { writeFileSync } from "fs"

new Koreanbots.Widgets().getVoteWidget("681219993911951360").then(r => writeFileSync(__dirname + "/widget.png", r))
