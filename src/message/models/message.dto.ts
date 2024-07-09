import {
  Field,
  Float,
  ID,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectID } from 'mongodb';

export enum GifType {
  Gif = 'gif',
  Sticker = 'sticker',
}

registerEnumType(GifType, {
  name: 'GifType',
});

export enum TagType {
  subTopic = 'subTopic',
}

registerEnumType(TagType, {
  name: 'TagType',
});

@InputType()
export class TagDto {
  @ApiProperty({ type: String })
  @Field(() => ID)
  id: string;

  @ApiProperty({ enum: TagType })
  @Field(() => TagType)
  type: TagType;
}

@ObjectType()
export class TagDtoOutput {
  @ApiProperty({ type: String })
  @Field(() => ID)
  id: string;

  @ApiProperty({ enum: TagType })
  @Field(() => TagType)
  type: TagType;
}

@InputType()
export class ReplyMessageDto {
  @Field()
  id: ObjectID;
}

@InputType()
export class GifDto {
  @Field()
  id: string;

  @Field(() => GifType)
  type: GifType;

  @Field()
  width: number;

  @Field()
  height: number;

  @Field(() => Float)
  aspectRatio: number;
}

@InputType()
export class ImageDto {
  @Field()
  url: string;
}

export enum AttachmentType {
  PDF = 'pdf',
}

registerEnumType(AttachmentType, {
  name: 'AttachmentType',
});

@InputType()
export class AttachmentDto {
  @Field()
  link: string;

  @Field(() => AttachmentType)
  type: AttachmentType;

  @Field(() => String, { nullable: true })
  size?: string;

  @Field(() => String, { nullable: true })
  fileName?: string;
}

@InputType()
export class PollOptionDto {
  @Field()
  option: string;

  @Field(() => [ObjectID], { defaultValue: [] })
  votes?: Set<ObjectID>;
}

@InputType()
export class PollDto {
  @Field(() => String)
  question: string;

  @Field(() => [PollOptionDto])
  options: PollOptionDto[];

  @Field(() => Boolean)
  allowMultipleAnswers: boolean;
}

@InputType()
export class RichContentDto {
  @Field(() => ReplyMessageDto, { nullable: true })
  reply?: ReplyMessageDto;

  @Field(() => GifDto, { nullable: true })
  giphy?: GifDto;

  @Field(() => [ImageDto], { nullable: true })
  images?: ImageDto[];

  @Field(() => [AttachmentDto], { nullable: true })
  attachments?: AttachmentDto[];

  @Field(() => PollDto, { nullable: true })
  poll?: PollDto;
}

@InputType()
export class MessageDto {
  @Field()
  text: string;

  @Field()
  conversationId: ObjectID;

  @Field(() => RichContentDto, { nullable: true })
  richContent?: RichContentDto;
}

// TODO Min - Max on limit
@InputType()
export class GetMessageDto {
  @Field()
  conversationId: ObjectID;

  @Field({ nullable: true })
  offsetId?: ObjectID;

  @Field({ defaultValue: 40 })
  limit: number;
}

@InputType()
export class DeleteMessageDto {
  @Field()
  conversationId: ObjectID;

  @Field()
  messageId: ObjectID;
}

@InputType()
export class ResolveMessageDto {
  @Field()
  conversationId: ObjectID;

  @Field()
  messageId: ObjectID;
}

@InputType()
export class LikeMessageDto {
  @Field(() => ObjectID)
  userId: ObjectID;

  @Field(() => ObjectID)
  messageId: ObjectID;

  @Field(() => ObjectID)
  conversationId: ObjectID;
}

@InputType()
export class ReactionDto {
  @Field(() => String)
  reaction: string;

  @Field(() => String)
  reactionUnicode: string;

  @Field(() => ObjectID)
  messageId: ObjectID;

  @Field(() => ObjectID)
  conversationId: ObjectID;
}
