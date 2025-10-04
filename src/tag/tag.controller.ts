import { Controller, Get } from "@nestjs/common";
import { TagService } from "./tag.service";

@Controller('tags')
export class TagController {
    constructor (private readonly tagService: TagService) {}

    @Get()
    getAll() {
        return this.tagService.getAll();
    }
}

// {
//   "singleQuote": true,
//   "trailingComma": "all",
//   "endOfLine": "auto",
//   "useTabs": false,
//   "tabWidth": 2
// }
