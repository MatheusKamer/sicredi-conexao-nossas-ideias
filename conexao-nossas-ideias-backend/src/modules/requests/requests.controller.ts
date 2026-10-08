import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { FindRequestsDto } from './dto/find-requests.dto';
import { ActiveUserId } from 'src/shared/decorators/ActiveUserId';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(
    @ActiveUserId() userId: string,
    @Body() createRequestDto: CreateRequestDto,
  ) {
    return this.requestsService.create(userId, createRequestDto);
  }

  @Get()
  findAll(@Query() query: FindRequestsDto) {
    return this.requestsService.findAll(query);
  }

  @Get('summary')
  getSummary() {
    return this.requestsService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
    return this.requestsService.update(id, updateRequestDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.requestsService.remove(id);
  }
}
