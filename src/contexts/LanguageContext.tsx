'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

type Language = 'en';

type Translations = {
  [key: string]: string;
};

const translations: Record<string, string> = {
  welcome: 'Welcome',
  home: 'Home',
  movies: 'Movies',
  howItWorks: 'How It Works',
  connectWallet: 'Connect Wallet',
  // More translations can be added here
  joinRoom: 'Join Room',
  createRoom: 'Create Room',
  roomName: 'Room Name',
  cancel: 'Cancel',
  create: 'Create',
  popular: 'Popular',
  recent: 'Recently Added',
  noRooms: 'No rooms available',
  createRoomPrompt: 'Create a room to get started!',
  active: 'Active',
  pending: 'Pending',
  completed: 'Completed',
  vote: 'Vote',
  watching: 'Watching',
  viewers: 'Viewers',
  leave: 'Leave',
  fullscreen: 'Fullscreen',
  chat: 'Chat',
  send: 'Send',
  typeMessage: 'Type a message...',
  join: 'Join',
  buyTicket: 'Buy Ticket',
  price: 'Price',
  tokens: 'tokens',
  insufficientBalance: 'Insufficient balance',
  transactionPending: 'Transaction pending...',
  transactionSuccess: 'Transaction successful!',
  transactionError: 'Transaction failed',
  connectWalletToVote: 'Connect your wallet to vote',
  alreadyVoted: 'You have already voted',
  votingEnded: 'Voting has ended',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  warning: 'Warning',
  info: 'Info',
  close: 'Close',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  search: 'Search',
  filter: 'Filter',
  sort: 'Sort',
  all: 'All',
  none: 'None',
  select: 'Select',
  selected: 'Selected',
  clear: 'Clear',
  apply: 'Apply',
  reset: 'Reset',
  submit: 'Submit',
  cancelAction: 'Cancel',
  yes: 'Yes',
  no: 'No',
  ok: 'OK',
  continue: 'Continue',
  backToHome: 'Back to Home',
  somethingWentWrong: 'Something went wrong',
  tryAgain: 'Please try again',
  noInternet: 'No internet connection',
  serverError: 'Server error',
  notFound: 'Not found',
  unauthorized: 'Unauthorized',
  forbidden: 'Forbidden',
  badRequest: 'Bad request',
  timeout: 'Request timeout',
  unknownError: 'Unknown error',
  retry: 'Retry',
  loadingMore: 'Loading more...',
  noMoreItems: 'No more items',
  pullToRefresh: 'Pull to refresh',
  releaseToRefresh: 'Release to refresh',
  refreshing: 'Refreshing...',
  lastUpdated: 'Last updated',
  justNow: 'Just now',
  minutesAgo: 'minutes ago',
  hoursAgo: 'hours ago',
  daysAgo: 'days ago',
  weeksAgo: 'weeks ago',
  monthsAgo: 'months ago',
  yearsAgo: 'years ago',
  january: 'January',
  february: 'February',
  march: 'March',
  april: 'April',
  may: 'May',
  june: 'June',
  july: 'July',
  august: 'August',
  september: 'September',
  october: 'October',
  november: 'November',
  december: 'December',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
  jan: 'Jan',
  feb: 'Feb',
  mar: 'Mar',
  apr: 'Apr',
  mayShort: 'May',
  jun: 'Jun',
  jul: 'Jul',
  aug: 'Aug',
  sep: 'Sep',
  oct: 'Oct',
  nov: 'Nov',
  dec: 'Dec'
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
