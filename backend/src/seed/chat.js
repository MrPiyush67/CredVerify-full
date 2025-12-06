import { Conversation, Message } from '../features/chat/chat.model.js';
import { SEED_IDS } from './users.js';

// Helper to generate past dates
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const hoursAgo = (hours) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
};

// Create conversations between demo users
const createConversations = async () => {
  // Conversation 1: Priya (credentialist1) ↔ Dr. Kavita (validant1)
  const conv1 = await Conversation.create({
    participants: [SEED_IDS.credentialist1, SEED_IDS.validant1],
    lastMessageAt: hoursAgo(2),
  });

  // Conversation 2: Priya (credentialist1) ↔ Meera (curator1)
  const conv2 = await Conversation.create({
    participants: [SEED_IDS.credentialist1, SEED_IDS.curator1],
    lastMessageAt: hoursAgo(5),
  });

  // Conversation 3: Dr. Kavita (validant1) ↔ Meera (curator1)
  const conv3 = await Conversation.create({
    participants: [SEED_IDS.validant1, SEED_IDS.curator1],
    lastMessageAt: daysAgo(1),
  });

  return { conv1, conv2, conv3 };
};

// Create messages for each conversation
const createMessages = async (conversations) => {
  const { conv1, conv2, conv3 } = conversations;

  // Messages between Priya and Dr. Kavita (10+ messages)
  const conv1Messages = [
    {
      conversation: conv1._id,
      sender: SEED_IDS.credentialist1,
      content: 'Hi Dr. Kavita! I submitted my Machine Learning Specialization certificate from Coursera for verification. Could you please review it when you have time?',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.validant1],
      isRead: true,
      createdAt: daysAgo(12),
    },
    {
      conversation: conv1._id,
      sender: SEED_IDS.validant1,
      content: 'Hello Priya! Yes, I saw your submission. Let me check the Coursera API to verify your certificate.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.validant1],
      isRead: true,
      createdAt: daysAgo(11),
    },
    {
      conversation: conv1._id,
      sender: SEED_IDS.credentialist1,
      content: 'Thank you so much! I really appreciate your help.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.validant1],
      isRead: true,
      createdAt: daysAgo(11),
    },
    {
      conversation: conv1._id,
      sender: SEED_IDS.validant1,
      content: 'Your Machine Learning Specialization has been verified successfully! The certificate is authentic and all metadata checks out.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.validant1],
      isRead: true,
      createdAt: daysAgo(10),
    },
    {
      conversation: conv1._id,
      sender: SEED_IDS.credentialist1,
      content: 'Wonderful! That\'s great news. I also uploaded my IIT Delhi degree. Hope that one is straightforward too.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.validant1],
      isRead: true,
      createdAt: daysAgo(9),
    },
    {
      conversation: conv1._id,
      sender: SEED_IDS.validant1,
      content: 'I verified your IIT Delhi degree as well. Everything checks out with their records.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.validant1],
      isRead: true,
      createdAt: daysAgo(7),
    },
    {
      conversation: conv1._id,
      sender: SEED_IDS.credentialist1,
      content: 'Perfect! I noticed my GCP certificate was rejected. Could you tell me what went wrong?',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.validant1],
      isRead: true,
      createdAt: daysAgo(5),
    },
    {
      conversation: conv1._id,
      sender: SEED_IDS.validant1,
      content: 'The credential ID you provided couldn\'t be found in Google Cloud\'s verification system. Please double-check the ID on your certificate and resubmit with the correct information.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.validant1],
      isRead: true,
      createdAt: daysAgo(4),
    },
    {
      conversation: conv1._id,
      sender: SEED_IDS.credentialist1,
      content: 'Oh I see! I might have made a typo. Let me check my original certificate and resubmit. Thanks for the clarification!',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.validant1],
      isRead: true,
      createdAt: daysAgo(4),
    },
    {
      conversation: conv1._id,
      sender: SEED_IDS.validant1,
      content: 'No problem! Always happy to help. Just make sure to upload the correct document.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.validant1],
      isRead: true,
      createdAt: daysAgo(3),
    },
    {
      conversation: conv1._id,
      sender: SEED_IDS.credentialist1,
      content: 'Will do! I also have two more certifications pending review. Hopefully those will be verified soon.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.validant1],
      isRead: true,
      createdAt: hoursAgo(48),
    },
    {
      conversation: conv1._id,
      sender: SEED_IDS.validant1,
      content: 'I\'ll review them this week. The queue is a bit long but I should get to them soon!',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.validant1],
      isRead: true,
      createdAt: hoursAgo(2),
    },
  ];

  // Messages between Priya and Meera (10+ messages)
  const conv2Messages = [
    {
      conversation: conv2._id,
      sender: SEED_IDS.credentialist1,
      content: 'Hi Meera! I saw the Senior Full Stack Developer position at StartupX Technologies. The role looks really interesting!',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(8),
    },
    {
      conversation: conv2._id,
      sender: SEED_IDS.curator1,
      content: 'Hi Priya! Thank you for your interest. I\'d love to learn more about your background. Do you have experience with React and Node.js?',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(8),
    },
    {
      conversation: conv2._id,
      sender: SEED_IDS.credentialist1,
      content: 'Yes! I have about 4 years of experience with both technologies. I\'ve built several full-stack applications using the MERN stack.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(7),
    },
    {
      conversation: conv2._id,
      sender: SEED_IDS.curator1,
      content: 'That\'s excellent! I see you have AWS certification as well. That\'s a big plus for us since we\'re heavily invested in AWS infrastructure.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(7),
    },
    {
      conversation: conv2._id,
      sender: SEED_IDS.credentialist1,
      content: 'Yes, I just got it verified recently! I\'ve worked with EC2, S3, Lambda, and several other AWS services in my previous projects.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(6),
    },
    {
      conversation: conv2._id,
      sender: SEED_IDS.curator1,
      content: 'Perfect! Would you be available for a technical interview next week? I\'d like to discuss your experience in more detail.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(6),
    },
    {
      conversation: conv2._id,
      sender: SEED_IDS.credentialist1,
      content: 'Absolutely! I\'m available on Tuesday or Thursday afternoon. Which day works better for you?',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(5),
    },
    {
      conversation: conv2._id,
      sender: SEED_IDS.curator1,
      content: 'Thursday at 3 PM would be great! I\'ll send you a calendar invite with the video call link.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(5),
    },
    {
      conversation: conv2._id,
      sender: SEED_IDS.credentialist1,
      content: 'Sounds good! Should I prepare anything specific for the interview?',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(4),
    },
    {
      conversation: conv2._id,
      sender: SEED_IDS.curator1,
      content: 'Just be ready to discuss your past projects and maybe solve a couple of coding challenges. Nothing too complex - we want to see your problem-solving approach.',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(4),
    },
    {
      conversation: conv2._id,
      sender: SEED_IDS.credentialist1,
      content: 'Got it! I\'ll review my recent projects and brush up on algorithms. Looking forward to it!',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(3),
    },
    {
      conversation: conv2._id,
      sender: SEED_IDS.curator1,
      content: 'Great! See you on Thursday. Good luck with your preparation!',
      readBy: [SEED_IDS.credentialist1, SEED_IDS.curator1],
      isRead: true,
      createdAt: hoursAgo(5),
    },
  ];

  // Messages between Dr. Kavita and Meera (10+ messages)
  const conv3Messages = [
    {
      conversation: conv3._id,
      sender: SEED_IDS.validant1,
      content: 'Hi Meera! I\'m reaching out because I saw your job postings on the platform. Are you looking for candidates with verified credentials?',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(10),
    },
    {
      conversation: conv3._id,
      sender: SEED_IDS.curator1,
      content: 'Hi Dr. Kavita! Yes, absolutely. Verified credentials are very important to us. It helps us trust that candidates have the qualifications they claim.',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(10),
    },
    {
      conversation: conv3._id,
      sender: SEED_IDS.validant1,
      content: 'That\'s wonderful to hear! We at CredVerify Central Authority are committed to maintaining the highest verification standards.',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(9),
    },
    {
      conversation: conv3._id,
      sender: SEED_IDS.curator1,
      content: 'Your work is invaluable! It saves us so much time during the hiring process. We don\'t have to manually verify every certificate.',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(9),
    },
    {
      conversation: conv3._id,
      sender: SEED_IDS.validant1,
      content: 'I\'m glad we can help! By the way, I noticed you\'re hiring for a DevOps position. Do you need help verifying cloud certifications?',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(8),
    },
    {
      conversation: conv3._id,
      sender: SEED_IDS.curator1,
      content: 'Yes! Cloud certifications are critical for that role. AWS and GCP certifications in particular.',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(8),
    },
    {
      conversation: conv3._id,
      sender: SEED_IDS.validant1,
      content: 'Perfect! We have direct verification channels with both AWS and Google Cloud. If you get any applications, feel free to send them my way for priority verification.',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(7),
    },
    {
      conversation: conv3._id,
      sender: SEED_IDS.curator1,
      content: 'That would be amazing! We have a few candidates in the pipeline. I\'ll make sure they get their credentials verified through your authority.',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(6),
    },
    {
      conversation: conv3._id,
      sender: SEED_IDS.validant1,
      content: 'Sounds good! Also, if you ever need verification statistics or reports for your hiring analytics, just let me know.',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(5),
    },
    {
      conversation: conv3._id,
      sender: SEED_IDS.curator1,
      content: 'That\'s a great offer! We\'re actually building a dashboard for tracking verified vs unverified applicants. Your data would be really helpful.',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(4),
    },
    {
      conversation: conv3._id,
      sender: SEED_IDS.validant1,
      content: 'Excellent! Let\'s schedule a call to discuss how we can collaborate more closely. I think there\'s a lot of potential here.',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(3),
    },
    {
      conversation: conv3._id,
      sender: SEED_IDS.curator1,
      content: 'Agreed! I\'ll send you my availability. Looking forward to working together!',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(2),
    },
    {
      conversation: conv3._id,
      sender: SEED_IDS.validant1,
      content: 'Perfect! Talk to you soon, Meera.',
      readBy: [SEED_IDS.validant1, SEED_IDS.curator1],
      isRead: true,
      createdAt: daysAgo(1),
    },
  ];

  // Insert all messages
  const messages1 = await Message.insertMany(conv1Messages);
  const messages2 = await Message.insertMany(conv2Messages);
  const messages3 = await Message.insertMany(conv3Messages);

  // Update conversations with last message
  await Conversation.findByIdAndUpdate(conv1._id, {
    lastMessage: messages1[messages1.length - 1]._id,
    lastMessageAt: messages1[messages1.length - 1].createdAt,
  });

  await Conversation.findByIdAndUpdate(conv2._id, {
    lastMessage: messages2[messages2.length - 1]._id,
    lastMessageAt: messages2[messages2.length - 1].createdAt,
  });

  await Conversation.findByIdAndUpdate(conv3._id, {
    lastMessage: messages3[messages3.length - 1]._id,
    lastMessageAt: messages3[messages3.length - 1].createdAt,
  });

  return { messages1, messages2, messages3 };
};

const seedChat = async () => {
  const conversations = await createConversations();
  const messages = await createMessages(conversations);

  console.log(`✅ Conversations created: 3 (between demo users)`);
  console.log(
    `✅ Messages created: ${messages.messages1.length + messages.messages2.length + messages.messages3.length} total`
  );
  console.log(`   - Priya ↔ Dr. Kavita: ${messages.messages1.length} messages`);
  console.log(`   - Priya ↔ Meera: ${messages.messages2.length} messages`);
  console.log(`   - Dr. Kavita ↔ Meera: ${messages.messages3.length} messages`);

  return { conversations, messages };
};

export default seedChat;
