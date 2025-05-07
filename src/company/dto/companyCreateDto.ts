import { ApiProperty } from '@nestjs/swagger';

export class CompanyCreateDto {
  @ApiProperty({
    example: 'Tech Corp',
    description: 'The name of the company to be created.'
  })
  name: string;

  @ApiProperty({
    example: 'A tech company specializing in software development.',
    description: 'A brief description of the company.'
  })
  description: string;
}
