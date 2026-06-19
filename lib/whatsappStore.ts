// Local mock storage for simulated WhatsApp messages

export interface MockMessage {
  id: string;
  phone: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
}

// Store in a global variable to persist across API reloads in local development
const globalForWhatsApp = global as typeof globalThis & {
  mockMessages?: MockMessage[];
};

if (!globalForWhatsApp.mockMessages) {
  globalForWhatsApp.mockMessages = [
    {
      id: "1",
      phone: "+919769763350",
      sender: "coach",
      text: "Welcome to the Evolution Fitness WhatsApp Sandbox! Send me a message (e.g., 'hi', 'suggest a workout', or 'give me my macros') to test the AI Coach.",
      timestamp: new Date(Date.now() - 60000).toISOString()
    }
  ];
}

export const whatsappStore = {
  getMessages: (phone?: string) => {
    const list = globalForWhatsApp.mockMessages || [];
    if (phone) {
      return list.filter((m) => m.phone === phone);
    }
    return list;
  },
  addMessage: (phone: string, sender: "user" | "coach", text: string) => {
    const newMessage: MockMessage = {
      id: Math.random().toString(36).substring(2, 9),
      phone,
      sender,
      text,
      timestamp: new Date().toISOString()
    };
    if (!globalForWhatsApp.mockMessages) {
      globalForWhatsApp.mockMessages = [];
    }
    globalForWhatsApp.mockMessages.push(newMessage);
    
    // Cap history at 50 messages
    if (globalForWhatsApp.mockMessages.length > 50) {
      globalForWhatsApp.mockMessages.shift();
    }
    return newMessage;
  },
  clear: () => {
    globalForWhatsApp.mockMessages = [];
  }
};
