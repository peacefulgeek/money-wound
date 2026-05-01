import React, { useState } from 'react';

interface Question {
  text: string;
  options: { label: string; value: number }[];
}

interface Assessment {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  questions: Question[];
  results: { min: number; max: number; title: string; body: string }[];
}

const ASSESSMENTS: Assessment[] = [
  {
    id: 'money-wound-type',
    title: 'What Is Your Money Wound?',
    subtitle: 'Discover the root pattern shaping your financial life',
    description: 'Your relationship with money was shaped long before you earned your first dollar. This assessment helps you identify the specific wound at the center of your financial story.',
    icon: '💛',
    color: '#1A5F5A',
    questions: [
      { text: 'When you check your bank balance, your first feeling is:', options: [{ label: 'Dread or avoidance', value: 1 }, { label: 'Shame or judgment', value: 2 }, { label: 'Anxiety or urgency', value: 3 }, { label: 'Numbness or disconnection', value: 4 }] },
      { text: 'When you receive unexpected money, you tend to:', options: [{ label: 'Spend it quickly before it disappears', value: 1 }, { label: 'Feel guilty and give it away', value: 2 }, { label: 'Save it compulsively out of fear', value: 3 }, { label: 'Feel like it isn\'t really yours', value: 4 }] },
      { text: 'Your parents\' relationship with money was:', options: [{ label: 'Chaotic - money came and went unpredictably', value: 1 }, { label: 'Shameful - money was never discussed', value: 2 }, { label: 'Scarce - there was never enough', value: 3 }, { label: 'Complicated - money was used as control', value: 4 }] },
      { text: 'When you earn more than expected, you feel:', options: [{ label: 'Surprised it won\'t last', value: 1 }, { label: 'Like you don\'t deserve it', value: 2 }, { label: 'Temporarily relieved but still anxious', value: 3 }, { label: 'Disconnected from it somehow', value: 4 }] },
      { text: 'Your biggest money behavior right now is:', options: [{ label: 'Impulsive spending or avoidance', value: 1 }, { label: 'Undercharging or giving too much', value: 2 }, { label: 'Hoarding or over-saving from fear', value: 3 }, { label: 'Self-sabotage when things get good', value: 4 }] },
    ],
    results: [
      { min: 5, max: 9, title: 'The Chaos Wound', body: 'Money felt unpredictable when you were young, so your nervous system learned to expect instability. You may overspend, avoid looking at numbers, or feel like money always slips through your fingers. The work here is learning that stability is safe - that you can handle knowing.' },
      { min: 10, max: 14, title: 'The Shame Wound', body: 'Somewhere along the way, you learned that wanting money - or having it - made you a bad person. You undercharge, over-give, and feel guilty for every purchase. The work here is separating your worth from your wallet. You are allowed to be compensated for what you offer.' },
      { min: 15, max: 19, title: 'The Scarcity Wound', body: 'Your body learned that there is never enough. Even when the numbers say otherwise, the fear doesn\'t quiet. You may hoard, over-save out of anxiety, or never feel financially safe no matter what the balance says. The work here is teaching your nervous system that abundance is real and sustainable.' },
      { min: 20, max: 25, title: 'The Unworthiness Wound', body: 'You self-sabotage when things get good. You feel like a fraud when you have money. You may unconsciously create financial crises to return to familiar struggle. The work here is examining the story that says you don\'t deserve to be okay - because that story is a lie someone else told you.' },
    ],
  },
  {
    id: 'scarcity-mindset',
    title: 'How Deep Is Your Scarcity Mindset?',
    subtitle: 'Measure the grip of not-enough thinking on your daily life',
    description: 'Scarcity consciousness isn\'t about how much money you have. It\'s a lens that distorts everything you see. This assessment measures how deeply scarcity thinking shapes your choices.',
    icon: '🌱',
    color: '#2D6A4F',
    questions: [
      { text: 'When a friend mentions a financial win, you feel:', options: [{ label: 'Genuinely happy for them', value: 1 }, { label: 'A twinge of envy or comparison', value: 2 }, { label: 'Like their gain somehow diminishes yours', value: 3 }, { label: 'Anxious about your own situation', value: 4 }] },
      { text: 'When you spend money on yourself, you feel:', options: [{ label: 'Good - you earned it', value: 1 }, { label: 'Slightly guilty', value: 2 }, { label: 'Like you need to justify it', value: 3 }, { label: 'Anxious about what you\'re losing', value: 4 }] },
      { text: 'How often do you think about money on a typical day?', options: [{ label: 'Occasionally, when relevant', value: 1 }, { label: 'Several times a day', value: 2 }, { label: 'Constantly in the background', value: 3 }, { label: 'It\'s almost always present', value: 4 }] },
      { text: 'When you imagine having more money, you feel:', options: [{ label: 'Excited and open', value: 1 }, { label: 'Hopeful but skeptical', value: 2 }, { label: 'Like it won\'t happen for you', value: 3 }, { label: 'Afraid of what might go wrong', value: 4 }] },
      { text: 'Your internal narrative about money is mostly:', options: [{ label: 'Money flows to me when I do good work', value: 1 }, { label: 'I have to work hard to keep what I have', value: 2 }, { label: 'There\'s never quite enough', value: 3 }, { label: 'Money is dangerous or corrupting', value: 4 }] },
    ],
    results: [
      { min: 5, max: 9, title: 'Abundance-Oriented', body: 'You have a relatively healthy relationship with financial possibility. You may have moments of scarcity thinking, but they don\'t run the show. Keep noticing when the old patterns surface - awareness is the whole game.' },
      { min: 10, max: 14, title: 'Mild Scarcity Patterns', body: 'Scarcity thinking shows up in specific situations - comparison, guilt around spending, or a low hum of financial anxiety. These patterns are workable. The key is catching them in real time and asking: is this thought true, or is it inherited?' },
      { min: 15, max: 19, title: 'Moderate Scarcity Grip', body: 'Scarcity is a significant filter through which you see your financial life. It\'s affecting your decisions, your relationships, and your sense of what\'s possible. This is healable. The work begins with understanding where this lens came from.' },
      { min: 20, max: 25, title: 'Deep Scarcity Consciousness', body: 'Not-enough thinking is woven into your identity. It shapes what you believe you deserve, what you allow yourself to want, and how you interpret every financial event. This isn\'t a character flaw - it\'s a learned survival strategy. And it can be unlearned.' },
    ],
  },
  {
    id: 'financial-trauma',
    title: 'Financial Trauma Assessment',
    subtitle: 'Understand how past financial pain lives in your body today',
    description: 'Financial trauma is real. It lives in your nervous system, not just your memories. This assessment helps you recognize the signs that past money pain is still running your present.',
    icon: '🌿',
    color: '#4A7C59',
    questions: [
      { text: 'When you receive a bill or financial statement, your body:', options: [{ label: 'Stays calm', value: 1 }, { label: 'Tenses slightly', value: 2 }, { label: 'Feels a wave of dread', value: 3 }, { label: 'Goes into freeze or avoidance', value: 4 }] },
      { text: 'Have you experienced a significant financial loss, crisis, or betrayal?', options: [{ label: 'No major events', value: 1 }, { label: 'One difficult period I\'ve mostly processed', value: 2 }, { label: 'Yes, and it still affects me', value: 3 }, { label: 'Multiple events that feel unresolved', value: 4 }] },
      { text: 'When you think about your financial future, you feel:', options: [{ label: 'Cautiously optimistic', value: 1 }, { label: 'Uncertain but okay', value: 2 }, { label: 'Anxious or hopeless', value: 3 }, { label: 'Like something bad is inevitable', value: 4 }] },
      { text: 'Money conversations with partners or family feel:', options: [{ label: 'Normal and manageable', value: 1 }, { label: 'Uncomfortable but doable', value: 2 }, { label: 'Highly charged or avoided', value: 3 }, { label: 'Dangerous or impossible', value: 4 }] },
      { text: 'When you make a financial mistake, you:', options: [{ label: 'Learn from it and move on', value: 1 }, { label: 'Feel bad for a while then recover', value: 2 }, { label: 'Spiral into shame or self-blame', value: 3 }, { label: 'Confirm your worst beliefs about yourself', value: 4 }] },
    ],
    results: [
      { min: 5, max: 9, title: 'Low Financial Trauma Indicators', body: 'You show few signs of unresolved financial trauma. You may have had difficult money experiences, but your nervous system seems to have integrated them relatively well. Stay curious about the moments when old patterns do surface.' },
      { min: 10, max: 14, title: 'Mild Trauma Residue', body: 'Some past financial pain is still present in your body and decisions. It may show up as avoidance, mild anxiety, or charged reactions to money conversations. Gentle somatic work and honest reflection can help you complete what was left unfinished.' },
      { min: 15, max: 19, title: 'Moderate Financial Trauma', body: 'Past financial pain is meaningfully affecting your present. Your nervous system is still in some degree of protection mode around money. This is not weakness - it\'s a logical response to real events. Trauma-informed support can help you move through it.' },
      { min: 20, max: 25, title: 'Significant Financial Trauma', body: 'Your body is carrying real financial trauma. The past is present in how you react, avoid, and relate to money. You deserve support that goes beyond budgeting. Somatic therapy, trauma-informed financial coaching, or simply naming what happened can begin the healing.' },
    ],
  },
  {
    id: 'money-relationship-style',
    title: 'Your Money Relationship Style',
    subtitle: 'Are you a hoarder, spender, avoider, or worrier?',
    description: 'We each have a dominant style in how we relate to money. Understanding yours is the first step to changing the patterns that aren\'t serving you.',
    icon: '🔮',
    color: '#6B4E71',
    questions: [
      { text: 'When you have extra money, your instinct is to:', options: [{ label: 'Save it immediately', value: 1 }, { label: 'Spend it on something you\'ve wanted', value: 2 }, { label: 'Not really notice it', value: 3 }, { label: 'Worry about losing it', value: 4 }] },
      { text: 'Your relationship to financial planning is:', options: [{ label: 'You track everything carefully', value: 1 }, { label: 'You spend first, track later (or never)', value: 2 }, { label: 'You avoid it entirely', value: 3 }, { label: 'You plan obsessively but still feel unsafe', value: 4 }] },
      { text: 'In a relationship, you tend to be the partner who:', options: [{ label: 'Controls the finances tightly', value: 1 }, { label: 'Spends freely and lets the other worry', value: 2 }, { label: 'Avoids money conversations', value: 3 }, { label: 'Worries constantly about the finances', value: 4 }] },
      { text: 'When you think about retirement or the future, you:', options: [{ label: 'Have a detailed plan and feel somewhat secure', value: 1 }, { label: 'Know you should plan but haven\'t', value: 2 }, { label: 'Don\'t think about it - too overwhelming', value: 3 }, { label: 'Think about it constantly with anxiety', value: 4 }] },
      { text: 'Your biggest money regret is usually:', options: [{ label: 'Being too tight and missing experiences', value: 1 }, { label: 'Overspending on things that didn\'t matter', value: 2 }, { label: 'Not paying attention sooner', value: 3 }, { label: 'Never feeling safe no matter what you do', value: 4 }] },
    ],
    results: [
      { min: 5, max: 9, title: 'The Guardian', body: 'You hold money tightly. You save, track, and control because money feels like safety. The shadow side of this style is rigidity - missing life experiences, difficulty sharing, and never feeling like you have enough even when you do. The invitation is to let money serve life, not replace it.' },
      { min: 10, max: 14, title: 'The Spender', body: 'You use money to feel alive, to reward yourself, to connect with others. Spending brings temporary relief or joy. The shadow is the aftermath - the guilt, the debt, the gap between income and outflow. The invitation is to ask what you\'re really shopping for.' },
      { min: 15, max: 19, title: 'The Avoider', body: 'Money feels too charged to look at directly. You don\'t open statements, don\'t track spending, don\'t make plans. Not because you\'re irresponsible - because the anxiety is too high. The invitation is to take one small step toward knowing, because the unknown is always scarier than the truth.' },
      { min: 20, max: 25, title: 'The Worrier', body: 'You think about money constantly, plan obsessively, and still don\'t feel safe. The worry is the wound, not the numbers. More money won\'t fix this - because the anxiety will just find a new threshold. The invitation is to work with the fear directly, not the finances.' },
    ],
  },
  {
    id: 'inherited-money-story',
    title: 'Your Inherited Money Story',
    subtitle: 'Trace the financial beliefs passed down through your family',
    description: 'Before you had a single financial experience of your own, you absorbed your family\'s relationship with money. This assessment helps you see which beliefs are truly yours - and which ones you inherited.',
    icon: '🌳',
    color: '#3D5A3E',
    questions: [
      { text: 'In your family growing up, money was talked about:', options: [{ label: 'Openly and practically', value: 1 }, { label: 'Occasionally and carefully', value: 2 }, { label: 'Only during crises', value: 3 }, { label: 'Never - it was taboo', value: 4 }] },
      { text: 'The dominant message about money in your household was:', options: [{ label: 'Money is a tool we manage responsibly', value: 1 }, { label: 'We work hard and get by', value: 2 }, { label: 'There\'s never enough', value: 3 }, { label: 'Money is dangerous or corrupting', value: 4 }] },
      { text: 'Your parents\' financial stress affected you as a child:', options: [{ label: 'Minimally - they shielded you well', value: 1 }, { label: 'Somewhat - you felt the tension', value: 2 }, { label: 'Significantly - you carried their worry', value: 3 }, { label: 'Deeply - you became the emotional caretaker', value: 4 }] },
      { text: 'When you look at your money behaviors today, they resemble your parents\':', options: [{ label: 'Rarely', value: 1 }, { label: 'In some ways', value: 2 }, { label: 'More than I\'d like to admit', value: 3 }, { label: 'Almost exactly', value: 4 }] },
      { text: 'The belief about money you most want to change is:', options: [{ label: 'I\'m not sure I have one', value: 1 }, { label: 'That I have to work hard to deserve it', value: 2 }, { label: 'That there will never be enough', value: 3 }, { label: 'That wanting money makes me bad', value: 4 }] },
    ],
    results: [
      { min: 5, max: 9, title: 'Relatively Clean Inheritance', body: 'Your family gave you a reasonably healthy financial foundation. You may have absorbed some limiting beliefs, but they don\'t dominate your story. Stay curious about the subtle ways family patterns still show up - they\'re often the quietest ones.' },
      { min: 10, max: 14, title: 'Moderate Inherited Patterns', body: 'Your family\'s money story is present in your own. Some of their beliefs, fears, and behaviors have become yours. The good news: you can see them. What you can see, you can change. The work is separating their story from your own.' },
      { min: 15, max: 19, title: 'Strong Inherited Patterns', body: 'Your family\'s financial wounds are significantly alive in you. Their scarcity, shame, or fear has become your operating system. This isn\'t your fault - you absorbed it before you could choose. But you can choose now what to carry forward and what to put down.' },
      { min: 20, max: 25, title: 'Deep Generational Transmission', body: 'You are carrying your family\'s financial trauma as if it were your own. Their losses, their shame, their survival strategies - all of it lives in you. The healing isn\'t just personal. It\'s generational. When you heal this, you change the story for everyone who comes after you.' },
    ],
  },
  {
    id: 'money-and-self-worth',
    title: 'Money and Self-Worth',
    subtitle: 'How much of your value do you tie to your net worth?',
    description: 'For many of us, money and self-worth have become dangerously entangled. This assessment helps you see how much your financial situation is shaping your sense of who you are.',
    icon: '✨',
    color: '#8B6914',
    questions: [
      { text: 'When you earn less than someone you respect, you feel:', options: [{ label: 'Neutral - money isn\'t how I measure people', value: 1 }, { label: 'Slightly lesser', value: 2 }, { label: 'Inadequate or behind', value: 3 }, { label: 'Like a failure', value: 4 }] },
      { text: 'When you can\'t afford something you want, you feel:', options: [{ label: 'Disappointed but okay', value: 1 }, { label: 'Frustrated with your situation', value: 2 }, { label: 'Ashamed', value: 3 }, { label: 'Like proof you\'re not enough', value: 4 }] },
      { text: 'Your financial situation affects your confidence in social situations:', options: [{ label: 'Rarely', value: 1 }, { label: 'Sometimes', value: 2 }, { label: 'Often', value: 3 }, { label: 'Almost always', value: 4 }] },
      { text: 'When you imagine being financially secure, you feel:', options: [{ label: 'Like you\'d still be the same person', value: 1 }, { label: 'Like you\'d be more relaxed', value: 2 }, { label: 'Like you\'d finally be worthy', value: 3 }, { label: 'Like you\'d finally be enough', value: 4 }] },
      { text: 'How you feel about yourself on a given day is:', options: [{ label: 'Mostly independent of your finances', value: 1 }, { label: 'Somewhat influenced by money stress', value: 2 }, { label: 'Strongly tied to your financial situation', value: 3 }, { label: 'Almost entirely determined by money', value: 4 }] },
    ],
    results: [
      { min: 5, max: 9, title: 'Healthy Separation', body: 'You have a relatively healthy separation between your financial situation and your sense of self. Money is a tool for you, not a verdict. This is rare and worth protecting. Notice the moments when the entanglement tries to creep back in.' },
      { min: 10, max: 14, title: 'Mild Entanglement', body: 'Money and self-worth are somewhat tangled for you. Financial stress affects your confidence, and financial wins feel like personal validation. The work is learning to hold your value as something that doesn\'t fluctuate with your bank balance.' },
      { min: 15, max: 19, title: 'Significant Entanglement', body: 'Your financial situation has a strong grip on how you feel about yourself. This is exhausting - because money is always changing, and so is your self-esteem. The healing is finding a floor of self-worth that money can\'t touch.' },
      { min: 20, max: 25, title: 'Deep Entanglement', body: 'Your sense of worthiness is almost entirely tied to your financial situation. When money is good, you feel good. When it\'s not, you feel like a failure. This is the deepest money wound there is - and it has nothing to do with money. It has to do with the story of whether you are enough.' },
    ],
  },
  {
    id: 'financial-avoidance',
    title: 'Financial Avoidance Scale',
    subtitle: 'How much are you looking away from your money reality?',
    description: 'Financial avoidance is one of the most common - and most costly - money behaviors. This assessment measures how much you\'re looking away, and what it might be costing you.',
    icon: '👁️',
    color: '#2C4A7C',
    questions: [
      { text: 'How often do you check your bank balance?', options: [{ label: 'Daily or weekly', value: 1 }, { label: 'Monthly', value: 2 }, { label: 'Only when I have to', value: 3 }, { label: 'I actively avoid it', value: 4 }] },
      { text: 'Unopened financial mail or emails in your life:', options: [{ label: 'I open everything promptly', value: 1 }, { label: 'I get to them eventually', value: 2 }, { label: 'There\'s a pile somewhere', value: 3 }, { label: 'I have a system of strategic ignorance', value: 4 }] },
      { text: 'Your knowledge of your actual financial situation is:', options: [{ label: 'Clear and current', value: 1 }, { label: 'Approximate', value: 2 }, { label: 'Vague', value: 3 }, { label: 'Deliberately unclear', value: 4 }] },
      { text: 'When a financial problem arises, you tend to:', options: [{ label: 'Address it quickly', value: 1 }, { label: 'Worry about it but eventually act', value: 2 }, { label: 'Hope it resolves itself', value: 3 }, { label: 'Avoid it until it becomes a crisis', value: 4 }] },
      { text: 'The thought of sitting down to review your finances feels:', options: [{ label: 'Normal or even satisfying', value: 1 }, { label: 'Mildly unpleasant', value: 2 }, { label: 'Anxiety-inducing', value: 3 }, { label: 'Impossible right now', value: 4 }] },
    ],
    results: [
      { min: 5, max: 9, title: 'Low Avoidance', body: 'You face your finances with relative clarity. You may not love it, but you don\'t run from it. This is a significant strength. Keep building the habit of regular, calm check-ins with your money reality.' },
      { min: 10, max: 14, title: 'Mild Avoidance', body: 'You avoid some financial tasks and delay others. The avoidance is manageable but it\'s costing you - in late fees, in missed opportunities, in the low-grade anxiety of not knowing. Small, consistent steps toward knowing will change this.' },
      { min: 15, max: 19, title: 'Moderate Avoidance', body: 'Financial avoidance is a significant pattern in your life. You\'re paying a real price for not knowing - financially and emotionally. The anxiety of avoidance is almost always worse than the reality you\'re avoiding. One honest look is the beginning.' },
      { min: 20, max: 25, title: 'High Avoidance', body: 'You are in active financial avoidance. The not-knowing has become a way of managing overwhelming anxiety. But the anxiety doesn\'t go away - it just goes underground. The most compassionate thing you can do for yourself is to look. Not fix everything. Just look.' },
    ],
  },
  {
    id: 'money-and-relationships',
    title: 'Money and Your Relationships',
    subtitle: 'How does money show up in your closest connections?',
    description: 'Money is one of the top sources of conflict in relationships - not because of the numbers, but because of the stories each person carries. This assessment explores how your money wound affects your closest relationships.',
    icon: '💞',
    color: '#7C3D52',
    questions: [
      { text: 'Talking about money with your partner or close family feels:', options: [{ label: 'Natural and productive', value: 1 }, { label: 'Uncomfortable but manageable', value: 2 }, { label: 'Charged and often leads to conflict', value: 3 }, { label: 'Impossible - we avoid it', value: 4 }] },
      { text: 'When a friend asks to borrow money, you:', options: [{ label: 'Can say yes or no based on the situation', value: 1 }, { label: 'Feel guilty saying no', value: 2 }, { label: 'Say yes even when you can\'t afford it', value: 3 }, { label: 'Feel resentful either way', value: 4 }] },
      { text: 'Financial inequality in a relationship (earning more or less) makes you feel:', options: [{ label: 'Neutral - it\'s just logistics', value: 1 }, { label: 'Slightly uncomfortable', value: 2 }, { label: 'Unequal in power or worth', value: 3 }, { label: 'Deeply threatened', value: 4 }] },
      { text: 'When your partner spends in a way you disagree with, you:', options: [{ label: 'Discuss it calmly', value: 1 }, { label: 'Feel anxious but don\'t always say so', value: 2 }, { label: 'Feel controlled or out of control', value: 3 }, { label: 'Shut down or explode', value: 4 }] },
      { text: 'Money secrets in your current or past relationships:', options: [{ label: 'None - full transparency', value: 1 }, { label: 'Small things I haven\'t mentioned', value: 2 }, { label: 'Significant things I\'ve hidden', value: 3 }, { label: 'A pattern of financial secrecy', value: 4 }] },
    ],
    results: [
      { min: 5, max: 9, title: 'Relatively Healthy Money Dynamics', body: 'Money doesn\'t dominate your relationships. You can talk about it, disagree about it, and navigate it without it becoming a crisis. This is worth protecting. Keep the conversations open and honest.' },
      { min: 10, max: 14, title: 'Some Money Tension', body: 'Money creates some friction in your relationships. You may avoid certain conversations, feel guilty around financial requests, or carry some resentment. The work is bringing more honesty into the financial dimension of your closest relationships.' },
      { min: 15, max: 19, title: 'Significant Money Conflict', body: 'Money is a source of real tension in your relationships. The conflict isn\'t really about the money - it\'s about what money means: safety, power, love, control. Getting underneath the numbers to the real conversation is the work.' },
      { min: 20, max: 25, title: 'Money as a Relationship Wound', body: 'Money has become deeply entangled with your most important relationships. There may be secrecy, resentment, power struggles, or complete avoidance. This is healable - but it requires honesty about what money is standing in for in these connections.' },
    ],
  },
  {
    id: 'abundance-readiness',
    title: 'Abundance Readiness Assessment',
    subtitle: 'Are you actually ready to receive more?',
    description: 'Most people think they want more money. But wanting and being ready are different things. This assessment explores whether your inner world is actually prepared to receive and hold abundance.',
    icon: '🌻',
    color: '#7A6B1A',
    questions: [
      { text: 'When you imagine having significantly more money, your first thought is:', options: [{ label: 'Excitement about what\'s possible', value: 1 }, { label: 'Practical planning', value: 2 }, { label: 'Worry about managing it', value: 3 }, { label: 'Doubt it would actually happen', value: 4 }] },
      { text: 'When good financial things happen, you tend to:', options: [{ label: 'Receive them with gratitude', value: 1 }, { label: 'Enjoy them but wait for the catch', value: 2 }, { label: 'Minimize or dismiss them', value: 3 }, { label: 'Sabotage them somehow', value: 4 }] },
      { text: 'Your relationship to receiving - money, compliments, help - is:', options: [{ label: 'Open and comfortable', value: 1 }, { label: 'Somewhat awkward', value: 2 }, { label: 'Difficult - you prefer to give', value: 3 }, { label: 'Almost impossible', value: 4 }] },
      { text: 'If you received a large sum of money tomorrow, you believe you would:', options: [{ label: 'Use it wisely and enjoy it', value: 1 }, { label: 'Use it well but feel some anxiety', value: 2 }, { label: 'Probably find a way to lose it', value: 3 }, { label: 'Feel like you don\'t deserve it', value: 4 }] },
      { text: 'The idea that you could be financially comfortable without struggle feels:', options: [{ label: 'Completely possible', value: 1 }, { label: 'Possible but unlikely', value: 2 }, { label: 'Like something that happens to other people', value: 3 }, { label: 'Dangerous or wrong somehow', value: 4 }] },
    ],
    results: [
      { min: 5, max: 9, title: 'High Abundance Readiness', body: 'Your inner world is relatively open to receiving more. You don\'t have strong blocks against abundance - you can imagine it, receive it, and hold it. The work now is practical: building the skills and systems to match your inner readiness.' },
      { min: 10, max: 14, title: 'Moderate Readiness with Some Blocks', body: 'You want abundance but part of you is still waiting for the catch. There\'s some ambivalence about whether you\'re allowed to have it. The work is identifying the specific belief that says abundance isn\'t safe or deserved for you.' },
      { min: 15, max: 19, title: 'Significant Abundance Blocks', body: 'Your inner world has real resistance to receiving more. You may self-sabotage, minimize good things, or believe abundance is for other people. These blocks are usually rooted in old stories about worthiness. The work is finding those stories and questioning them.' },
      { min: 20, max: 25, title: 'Deep Abundance Resistance', body: 'Something in you actively resists abundance. This might look like self-sabotage, a belief that wanting more is greedy, or a deep sense that you\'re not the kind of person who gets to be okay. This is the deepest work - and the most transformative. You are allowed to receive.' },
    ],
  },
];

function AssessmentCard({ assessment, onStart }: { assessment: Assessment; onStart: (id: string) => void }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: `2px solid transparent`,
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={() => onStart(assessment.id)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = assessment.color;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'transparent';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
      }}
    >
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{assessment.icon}</div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: assessment.color, marginBottom: '0.5rem', lineHeight: 1.3 }}>
        {assessment.title}
      </h3>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem', fontStyle: 'italic' }}>
        {assessment.subtitle}
      </p>
      <p style={{ fontSize: '0.875rem', color: '#444', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        {assessment.description}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', color: '#888' }}>{assessment.questions.length} questions</span>
        <button
          style={{
            background: assessment.color,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Begin
        </button>
      </div>
    </div>
  );
}

function AssessmentQuiz({ assessment, onBack }: { assessment: Assessment; onBack: () => void }) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (currentQ < assessment.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const total = answers.reduce((a, b) => a + b, 0);
  const result = assessment.results.find(r => total >= r.min && total <= r.max) || assessment.results[assessment.results.length - 1];
  const progress = ((currentQ) / assessment.questions.length) * 100;

  if (showResult) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: assessment.color, cursor: 'pointer', fontSize: '0.9rem', marginBottom: '2rem', padding: 0 }}>
          ← Back to all assessments
        </button>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{assessment.icon}</div>
          <h2 style={{ color: assessment.color, fontSize: '1.6rem', marginBottom: '0.5rem' }}>{assessment.title}</h2>
        </div>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: `3px solid ${assessment.color}` }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ background: assessment.color, color: 'white', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
              Your Result
            </span>
          </div>
          <h3 style={{ fontSize: '1.5rem', color: assessment.color, textAlign: 'center', marginBottom: '1.5rem' }}>
            {result.title}
          </h3>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#333', textAlign: 'left' }}>
            {result.body}
          </p>
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f6f0', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
              "Money is just energy with a story attached to it. This result is not a verdict - it's a starting point. The wound that shaped your relationship with money is also the doorway to healing it."
            </p>
            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.75rem', margin: '0.75rem 0 0' }}>- Kalesh</p>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onBack}
              style={{ flex: 1, background: assessment.color, color: 'white', border: 'none', borderRadius: '10px', padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', minWidth: '140px' }}
            >
              Take Another
            </button>
            <a
              href="/articles"
              style={{ flex: 1, background: 'white', color: assessment.color, border: `2px solid ${assessment.color}`, borderRadius: '10px', padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '140px' }}
            >
              Read Articles
            </a>
          </div>
        </div>
      </div>
    );
  }

  const question = assessment.questions[currentQ];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: assessment.color, cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1.5rem', padding: 0 }}>
        ← Back to all assessments
      </button>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#888' }}>{assessment.title}</span>
          <span style={{ fontSize: '0.85rem', color: '#888' }}>Question {currentQ + 1} of {assessment.questions.length}</span>
        </div>
        <div style={{ height: '6px', background: '#e8e0d4', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: assessment.color, borderRadius: '3px', transition: 'width 0.3s ease' }} />
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.5, marginBottom: '2rem' }}>
          {question.text}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt.value)}
              style={{
                background: '#f8f6f0',
                border: '2px solid transparent',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                fontSize: '0.95rem',
                color: '#333',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                lineHeight: 1.4,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = assessment.color;
                (e.currentTarget as HTMLButtonElement).style.background = 'white';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.background = '#f8f6f0';
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AssessmentsPage() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeAssessment = activeId ? ASSESSMENTS.find(a => a.id === activeId) : null;

  if (activeAssessment) {
    return (
      <div style={{ background: '#faf8f4', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '4rem' }}>
        <AssessmentQuiz assessment={activeAssessment} onBack={() => setActiveId(null)} />
      </div>
    );
  }

  return (
    <div style={{ background: '#faf8f4', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1A5F5A 0%, #0D3D3A 100%)', padding: '4rem 1.5rem 3rem', textAlign: 'center' }}>
        <h1 style={{ color: 'white', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontFamily: 'Georgia, serif', marginBottom: '1rem', lineHeight: 1.2 }}>
          Money Healing Assessments
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto 1.5rem', lineHeight: 1.7 }}>
          Nine reflective assessments to help you understand the invisible patterns shaping your financial life. Take your time. Be honest. The answers are already in you.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
          Free. No email required. No data collected.
        </p>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {ASSESSMENTS.map(a => (
            <AssessmentCard key={a.id} assessment={a} onStart={setActiveId} />
          ))}
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '1rem', color: '#555', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
            These assessments are for reflection and self-understanding. They are not a clinical diagnosis. If you are experiencing significant financial anxiety or trauma, please consider working with a trauma-informed therapist or financial coach.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '1rem', fontStyle: 'italic' }}>
            "The wound that shaped your relationship with money is also the doorway to healing it." - Kalesh
          </p>
        </div>
      </div>
    </div>
  );
}
