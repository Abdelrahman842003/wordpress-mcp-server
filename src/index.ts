#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { WordPressClient } from './wp-client.js';
import { tools, zodToJsonSchema } from './tools.js';

dotenv.config();

const WP_URL = process.env.WP_URL;
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APPLICATION_PASSWORD = process.env.WP_APPLICATION_PASSWORD;

if (!WP_URL) {
  console.error('[WordPress MCP Warning] WP_URL environment variable is not defined.');
}

const wpClient = new WordPressClient({
  baseUrl: WP_URL || 'https://example.com',
  username: WP_USERNAME,
  applicationPassword: WP_APPLICATION_PASSWORD,
});

const server = new Server(
  {
    name: 'wordpress-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: zodToJsonSchema(t.inputSchema),
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const tool = tools.find((t) => t.name === toolName);

  if (!tool) {
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
  }

  try {
    const parseResult = tool.inputSchema.safeParse(request.params.arguments || {});
    if (!parseResult.success) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid parameters for tool ${toolName}: ${parseResult.error.message}`
      );
    }

    const result = await tool.handler(wpClient, parseResult.data);
    return {
      content: [
        {
          type: 'text',
          text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${toolName}: ${error.message || String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[WordPress MCP Server] Running on stdio');
}

main().catch((error) => {
  console.error('[WordPress MCP Server] Fatal error:', error);
  process.exit(1);
});
