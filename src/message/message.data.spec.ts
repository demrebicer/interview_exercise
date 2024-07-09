import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectID } from 'mongodb';
import { MessageData } from './message.data';
import { ChatMessageModel, ChatMessageSchema } from './models/message.model';

import { ConfigManagerModule } from '../configuration/configuration-manager.module';
import {getTestConfiguration}  from '../configuration/configuration-manager.utils';
import { TagDto, TagType } from './models/message.dto';

const id = new ObjectID('5fe0cce861c8ea54018385af');
const conversationId = new ObjectID();
const senderId = new ObjectID('5fe0cce861c8ea54018385af');
const sender2Id = new ObjectID('5fe0cce861c8ea54018385aa');
const sender3Id = new ObjectID('5fe0cce861c8ea54018385ab');

class TestMessageData extends MessageData {
  async deleteMany() {
    await this.chatMessageModel.deleteMany();
  }
}

jest.retryTimes(3); //To handle database execution delay
describe('MessageData', () => {
  let messageData: TestMessageData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigManagerModule],
          useFactory: () => {
            const databaseConfig =
              getTestConfiguration().database;
            return {
              uri: databaseConfig.connectionString,
            };
          },
        }),
        MongooseModule.forFeature([
          { name: ChatMessageModel.name, schema: ChatMessageSchema },
        ]),
      ],
      providers: [TestMessageData],
    }).compile();

    messageData = module.get<TestMessageData>(TestMessageData);
  });

  beforeEach(
    async () => {
      messageData.deleteMany();
    }
  );

  afterEach(async () => {
    messageData.deleteMany();
  });

  it('should be defined', () => {
    expect(messageData).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(messageData.create).toBeDefined();
    });

    it('successfully creates a message', async () => {
      const conversationId = new ObjectID();
      const message = await messageData.create(
        { conversationId, text: 'Hello world' },
        senderId,
      );

      expect(message).toMatchObject(
        {
          likes: [],
          resolved: false,
          deleted: false,
          reactions: [],
          text: 'Hello world',
          senderId: senderId,
          conversationId: conversationId,
          conversation: { id: conversationId.toHexString() },
          likesCount: 0,
          tags: [],
          sender: { id: senderId.toHexString() },
        }
      );

    });
  });


  describe('get', () => {
    it('should be defined', () => {
      expect(messageData.getMessage).toBeDefined();
    });

    it('successfully gets a message', async () => {
      const conversationId = new ObjectID();
      const sentMessage = await messageData.create(
        { conversationId, text: 'Hello world' },
        senderId,
      );

      const gotMessage = await messageData.getMessage(sentMessage.id.toHexString())

      expect(gotMessage).toMatchObject(sentMessage)
    });
  });

  describe('delete', () => {
    it('successfully marks a message as deleted', async () => {
      const conversationId = new ObjectID();
      const message = await messageData.create(
        { conversationId, text: 'Message to delete' },
        senderId,
      );

      // Make sure that it started off as not deleted
      expect(message.deleted).toEqual(false);

      // And that is it now deleted
      const deletedMessage = await messageData.delete(new ObjectID(message.id));
      expect(deletedMessage.deleted).toEqual(true);
    });
  });

  describe('updateTags', () => {
    it('successfully updates tags on a message', async () => {
      const conversationId = new ObjectID();
      const message = await messageData.create(
        { conversationId, text: 'Message to tag' },
        senderId,
      );

      const tags: TagDto[] = [
        { id: 'tag1', type: TagType.subTopic },
        { id: 'tag2', type: TagType.subTopic },
      ];

      const updatedMessage = await messageData.updateTags(
        new ObjectID(message.id),
        tags,
      );

      const updatedTags = updatedMessage.tags?.map(({ id, type }) => ({ id, type })) || [];

      expect(updatedTags).toEqual(tags);
    });
  });

  describe('removeTags', () => {
    it('successfully removes tags from a message', async () => {
      const conversationId = new ObjectID();
      var tags: TagDto[] = [
        { id: 'tag1', type: TagType.subTopic },
        { id: 'tag2', type: TagType.subTopic },
      ];

      const message = await messageData.create(
        { conversationId, text: 'Message to tag' },
        senderId,
      );

      const updatedMessage = await messageData.updateTags(
        new ObjectID(message.id),
        tags,
      );

      const updatedTags = updatedMessage.tags?.map(({ id, type }) => ({ id, type })) || [];

      expect(updatedTags).toEqual(tags);

      tags = [tags[0]];

      const removedMessage = await messageData.updateTags(
        new ObjectID(message.id),
        tags,
      );

      const removedTags = removedMessage.tags?.map(({ id, type }) => ({ id, type })) || [];

      expect(removedTags).toEqual(tags);

    });
  });

  describe('filterByTags', () => {
    it('successfully filters messages by tags', async () => {
      const conversationId = new ObjectID();

      const tags: TagDto[] = [
        { id: 'tag1', type: TagType.subTopic },
        { id: 'tag2', type: TagType.subTopic },
      ];

      const message = await messageData.create(
        { conversationId, text: 'Message to tag' },
        senderId,
      );

      const updatedMessage = await messageData.updateTags(
        new ObjectID(message.id),
        tags,
      );

      const messages = await messageData.getMessagesGroupedByConversation(
        [updatedMessage.conversationId],
        undefined,
        undefined,
        "tag1",
        TagType.subTopic
      );

      expect(messages[0].messages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: 'Message to tag' })
        ])
      );

      const messagesWithTag3 = await messageData.getMessagesGroupedByConversation(
        [updatedMessage.conversationId],
        undefined,
        undefined,
        "tag3",
        TagType.subTopic
      );
  
      expect(messagesWithTag3).toEqual([]);
    });
  });

  
});
