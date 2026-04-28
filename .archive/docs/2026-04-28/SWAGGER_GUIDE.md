# Swagger/OpenAPI Documentation Guide

**Location**: `http://localhost:4000/docs` (local development)
**Status**: Auto-generated from code decorators
**Sync**: Real-time (every restart)

---

## Quick Start: Document an Endpoint

Every endpoint should have these decorators:

```typescript
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  /**
   * Retrieve all projects for current tenant
   */
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List all projects',
    description: 'Returns paginated list of projects scoped to tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'List of projects',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProjectDto' },
        },
        meta: {
          type: 'object',
          properties: { timestamp: { type: 'string' } },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listProjects() {
    // ...
  }

  /**
   * Create a new project
   */
  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create project',
    description: 'Creates a new project in the current tenant',
  })
  @ApiResponse({ status: 201, description: 'Project created', type: ProjectDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Project slug already exists' })
  async createProject(@Body() dto: CreateProjectDto) {
    // ...
  }

  /**
   * Get project by ID
   */
  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({ name: 'id', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project found', type: ProjectDto })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProject(@Param('id') id: string) {
    // ...
  }
}
```

---

## DTO Classes (Auto-Documentation)

Define DTOs with `@ApiProperty()` for automatic schema generation:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'Ubatuba REURB North Zone',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Unique slug for URL-friendly reference',
    example: 'ubatuba-north-zone',
    pattern: '^[a-z0-9-]+$',
  })
  @IsString()
  @MinLength(3)
  slug: string;

  @ApiProperty({
    description: 'Project description',
    required: false,
    example: 'Regularization project for northern region',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ProjectDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'Ubatuba REURB North Zone' })
  name: string;

  @ApiProperty({ example: 'ubatuba-north-zone' })
  slug: string;

  @ApiProperty({
    example: '2026-03-31T12:00:00Z',
    description: 'ISO 8601 timestamp',
  })
  createdAt: Date;
}
```

---

## Common Decorators

### Operation & Tags
```typescript
@ApiTags('REURB')              // Group endpoints in Swagger UI
@ApiOperation({
  summary: 'Create REURB project',     // One-liner
  description: 'Long description...',  // Full explanation
  operationId: 'createReurbProject',   // Optional explicit ID
})
```

### Parameters
```typescript
@ApiParam({
  name: 'id',
  description: 'Resource ID',
  example: '507f1f77bcf86cd799439011',
})
@ApiQuery({
  name: 'status',
  description: 'Filter by status',
  enum: ['draft', 'published', 'archived'],
  required: false,
})
@ApiHeader({
  name: 'x-tenant-id',
  description: 'Tenant identifier',
  required: true,
})
```

### Responses
```typescript
@ApiResponse({
  status: 200,
  description: 'Success',
  type: ProjectDto,
})
@ApiResponse({
  status: 400,
  description: 'Validation error',
  schema: {
    type: 'object',
    properties: {
      status: { type: 'number' },
      title: { type: 'string' },
      detail: { type: 'string' },
      errors: { type: 'object' },
    },
  },
})
@ApiResponse({
  status: 404,
  description: 'Not found',
})
```

### Authentication
```typescript
@ApiBearerAuth('access-token')    // Requires JWT token
@ApiBearerAuth()                   // Auto-ref from DocumentBuilder
@ApiSecurity('api_key')            // Custom security
@Public()                           // Bypass auth (document explicitly!)
```

---

## Response Format (Standard)

All responses follow RFC 7807-like format:

### Success (2xx)
```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Project Name"
  },
  "meta": {
    "timestamp": "2026-03-31T12:00:00Z"
  }
}
```

### Error (4xx/5xx)
```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Validation failed",
  "instance": "/projects",
  "correlationId": "abc-123-def",
  "errors": {
    "name": "Name is required"
  }
}
```

Document error shapes:
```typescript
@ApiResponse({
  status: 400,
  description: 'Validation error',
  schema: {
    type: 'object',
    example: {
      type: 'about:blank',
      title: 'Bad Request',
      status: 400,
      detail: 'Email already exists',
      instance: '/projects',
      correlationId: 'abc-123',
      field: 'email'
    },
  },
})
```

---

## Example: Full Endpoint Documentation

```typescript
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, ProjectDto } from './dtos/project.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Create a new project in the current tenant
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create project',
    description: 'Creates a new project scoped to the authenticated tenant',
  })
  @ApiBody({
    type: CreateProjectDto,
    description: 'Project creation payload',
    examples: {
      example1: {
        summary: 'Simple project',
        value: {
          name: 'Ubatuba Zone 1',
          slug: 'ubatuba-zone-1',
          description: 'First regularization zone',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: ProjectDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    schema: {
      type: 'object',
      example: {
        status: 400,
        title: 'Bad Request',
        detail: 'Slug is required',
        errors: { slug: 'Must be unique' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Project slug already exists',
    schema: {
      type: 'object',
      example: {
        status: 409,
        title: 'Conflict',
        detail: 'Project slug already exists',
        field: 'slug',
      },
    },
  })
  async create(@Body() dto: CreateProjectDto): Promise<ProjectDto> {
    return await this.projectsService.create(dto);
  }

  /**
   * Get project by ID
   */
  @Get(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get project by ID',
    description: 'Retrieves a single project by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Project MongoDB ObjectId',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Project found',
    type: ProjectDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
    schema: {
      type: 'object',
      example: {
        status: 404,
        title: 'Not Found',
        detail: 'Project with id "999" not found',
      },
    },
  })
  async findOne(@Param('id') id: string): Promise<ProjectDto> {
    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new NotFoundException(`Project with id "${id}" not found`);
    }
    return project;
  }

  /**
   * Update a project
   */
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update project',
    description: 'Partially updates a project (PATCH semantics)',
  })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiBody({
    type: UpdateProjectDto,
    description: 'Partial project update',
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated',
    type: ProjectDto,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    return await this.projectsService.update(id, dto);
  }

  /**
   * Delete a project
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Delete project',
    description: 'Permanently deletes a project (caution!)',
  })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({
    status: 204,
    description: 'Project deleted (no content)',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  @ApiResponse({
    status: 422,
    description: 'Cannot delete project with active processes',
    schema: {
      type: 'object',
      example: {
        status: 422,
        title: 'Unprocessable Entity',
        detail: 'Cannot delete project with active processes',
        details: { activeProcessCount: 5 },
      },
    },
  })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.projectsService.remove(id);
  }
}
```

---

## Validation: Is My Endpoint Documented?

Run these checks:
1. **Visit** `http://localhost:4000/docs` locally
2. **Search** for your endpoint name in the UI
3. **Verify**: All methods have descriptions & examples
4. **Test**: Click "Try it out" & verify response schema

### Auto-Check Script
```bash
# Generate OpenAPI JSON (used by validators)
npm run build
curl -s http://localhost:4000/docs-json > api-spec.json

# Optional: Validate against OpenAPI 3.0 spec
npx swagger-cli validate api-spec.json
```

---

## Common Mistakes to Avoid

❌ **Missing `@ApiTags()`**
```typescript
@Controller('users')  // Bad: can't find in Swagger
export class UsersController {}
```

✅ **With tags**
```typescript
@ApiTags('Users')
@Controller('users')
export class UsersController {}
```

---

❌ **No DTO types**
```typescript
@Post()
@ApiResponse({ status: 200 })  // Bad: no schema
async create(@Body() data: any) {}
```

✅ **Typed DTOs**
```typescript
@Post()
@ApiResponse({ status: 201, type: UserDto })
async create(@Body() data: CreateUserDto) {}
```

---

❌ **Missing error responses**
```typescript
@Post()
@ApiResponse({ status: 201 })  // Bad: ignores 400/409
async create(@Body() dto: CreateUserDto) {}
```

✅ **All status codes documented**
```typescript
@Post()
@ApiResponse({ status: 201, type: UserDto })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 409, description: 'Email already exists' })
async create(@Body() dto: CreateUserDto) {}
```

---

## Testing Swagger Spec

```bash
# Start API
npm run dev

# Test Swagger endpoint
curl -s http://localhost:4000/docs-json | jq . | head -50

# Should show:
# {
#   "openapi": "3.0.0",
#   "info": { "title": "FlyDea SaaS API", ... },
#   "paths": { ... },
#   "components": { ... }
# }
```

---

## Next Steps

1. **Gradually add decorators** to all existing endpoints
2. **Test locally** at `http://localhost:4000/docs`
3. **CI/CD**: Validate Swagger spec on every build
4. **Client generation**: Use OpenAPI spec to generate TypeScript client (openapi-generator)

