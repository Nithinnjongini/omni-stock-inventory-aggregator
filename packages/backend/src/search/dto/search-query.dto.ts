import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchQueryDto {
  @ApiProperty({
    description: 'Product search query',
    example: 'DeWalt 20V Drill',
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({
    description: '5-digit US Zip Code',
    example: '55401',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 5, { message: 'Zip code must be exactly 5 digits' })
  @Matches(/^\d{5}$/, { message: 'Zip code must contain only digits' })
  zipCode: string;
}
