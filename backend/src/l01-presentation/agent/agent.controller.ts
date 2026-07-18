import { BadRequestException, Controller, Post, Body, UseGuards, Request, Get, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../l03-application/auth/guards/jwt-auth.guard';
import { AgentService } from '../../l02-agent/agent.service';
import { ConversationsService } from '../../l02-agent/conversations.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Agent')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agent')
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly conversationsService: ConversationsService
  ) {}

  @Post('text')
  @ApiOperation({ summary: 'Enviar mensaje de texto al agente copiloto' })
  async sendText(@Request() req, @Body('text') text: string) {
    const result = await this.agentService.processTextMessage(req.user.sub, text);
    return {
      message: result.message,
      action: result.action,
      products: result.products,
      intention: result.intention,
    };
  }

  @Post('voice')
  @ApiOperation({ summary: 'Enviar mensaje de voz al agente copiloto' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('audio'))
  async sendVoice(@Request() req, @UploadedFile() file: any) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No se recibió ningún audio.');
    }

    const result = await this.agentService.processVoiceMessage(req.user.sub, file.buffer, file.mimetype);
    return {
      transcribedText: result.transcribedText,
      message: result.message,
      action: result.action,
      products: result.products,
      intention: result.intention,
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Obtener historial de conversaciones' })
  async getHistory(@Request() req) {
    return this.conversationsService.getConversationHistory(req.user.sub);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirmar acción del agente' })
  async confirmAction(@Request() req, @Body('actionId') actionId: string) {
    return { success: true, message: 'Acción confirmada' };
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancelar acción del agente' })
  async cancelAction(@Request() req, @Body('actionId') actionId: string) {
    return { success: true, message: 'Acción cancelada' };
  }
}
