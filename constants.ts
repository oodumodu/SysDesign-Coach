import { SectionConfig, ProblemDefinition } from './types';

export const SYSTEM_DESIGN_PROBLEMS: ProblemDefinition[] = [
  {
    id: 'instagram',
    title: 'Design a Photo Sharing System',
    description: 'Design a system (like Instagram) where users can upload photos, follow other users, and view a feed of photos from people they follow. Focus on scalability, feed generation, and media storage.'
  },
  {
    id: 'tinyurl',
    title: 'Design a URL Shortener',
    description: 'Design a service (like TinyURL or Bit.ly) that converts long URLs into short aliases and redirects users. Focus on high availability, ID generation strategies, and read-heavy traffic patterns.'
  },
  {
    id: 'whatsapp',
    title: 'Design a Chat Application',
    description: 'Design a real-time messaging system (like WhatsApp) supporting 1-on-1 and group chats. Focus on message delivery guarantees, offline storage, websocket handling, and user presence.'
  },
  {
    id: 'uber',
    title: 'Design a Ride Sharing Service',
    description: 'Design a platform (like Uber/Lyft) to match riders with drivers and track locations in real-time. Focus on geospatial indexing (QuadTrees/Geohash), high-frequency location updates, and consistency.'
  },
  {
    id: 'youtube',
    title: 'Design a Video Streaming Platform',
    description: 'Design a video platform (like YouTube/Netflix) for uploading and streaming content. Focus on large file blob storage, CDN usage, transcoding pipelines, and adaptive bitrate streaming.'
  },
  {
    id: 'crawler',
    title: 'Design a Web Crawler',
    description: 'Design a distributed web crawler that harvests pages from the web for a search engine. Focus on deduplication, politeness, distributed task queues, and handling massive scale.'
  },
  {
    id: 'ecommerce',
    title: 'Design an E-commerce Inventory System',
    description: 'Design a system (like Amazon) to handle product inventory and ordering. Focus on concurrency control (handling overselling), database locking, and eventual consistency for search indexing.'
  }
];

export const SYSTEM_DESIGN_SECTIONS: SectionConfig[] = [
  // 1. Requirements
  {
    id: 'functional_reqs',
    category: '1. Requirements Clarification',
    title: 'Functional Requirements',
    description: 'List the specific features and capabilities the system must provide.',
    placeholder: '- Feature 1...\n- Feature 2...\n- User capabilities...',
  },
  {
    id: 'non_functional_reqs',
    category: '1. Requirements Clarification',
    title: 'Non-Functional Requirements',
    description: 'Define system qualities like scalability, availability, latency, and consistency requirements.',
    placeholder: '- Availability (e.g., 99.99%)\n- Latency requirements\n- Consistency model (Strong vs Eventual)...',
  },

  // 2. Estimation
  {
    id: 'traffic_estimates',
    category: '2. Back-of-the-Envelope Estimation',
    title: 'Traffic & DAU Estimates',
    description: 'Estimate Daily Active Users (DAU) and Requests Per Second (QPS) for reads and writes.',
    placeholder: 'DAU: 10 Million\nRead QPS: ~10k\nWrite QPS: ~100...',
  },
  {
    id: 'storage_estimates',
    category: '2. Back-of-the-Envelope Estimation',
    title: 'Storage Estimates',
    description: 'Calculate total storage required over a specific period (e.g., 5 years), including media and metadata.',
    placeholder: 'Data size per entry * Entries per day * Retention period...',
  },
  {
    id: 'bandwidth_estimates',
    category: '2. Back-of-the-Envelope Estimation',
    title: 'Bandwidth Estimates',
    description: 'Estimate network bandwidth usage for incoming (ingress) and outgoing (egress) traffic.',
    placeholder: 'Ingress: 40TB / 86400s = ~460 MB/s...',
  },

  // 3. API Design
  {
    id: 'api_endpoints',
    category: '3. API Design',
    title: 'Core API Endpoints',
    description: 'Define the key REST or RPC endpoints, including method, path, and key parameters.',
    placeholder: 'POST /resource\nGET /resource/:id...',
  },

  // 4. Data Model
  {
    id: 'db_schema',
    category: '4. Data Model & Storage',
    title: 'Database Schema Design',
    description: 'Outline the data model (tables/collections, columns/fields) and relationships.',
    placeholder: 'Table A: id (PK), col1, col2\nTable B: id (PK), a_id (FK)...',
  },
  {
    id: 'db_choice',
    category: '4. Data Model & Storage',
    title: 'Storage Technology Choice',
    description: 'Select the appropriate database technologies (SQL vs NoSQL, Blob storage) and justify your choice.',
    placeholder: 'Use Relational DB for...\nUse NoSQL for...\nUse Blob storage for...',
  },

  // 5. High Level Design
  {
    id: 'hld_components',
    category: '5. High-Level Design',
    title: 'System Architecture Components',
    description: 'Identify the major system components (Load Balancers, API Gateway, Services, Queues).',
    placeholder: 'Client -> CDN -> Load Balancer -> Service A -> Database...',
  },

  // 6. Detailed Design
  {
    id: 'partitioning',
    category: '6. Detailed Component Design',
    title: 'Partitioning & Sharding',
    description: 'Explain how you will shard data to handle scale (e.g., Sharding Key selection).',
    placeholder: 'Shard by UserID...\nConsistent Hashing strategy...',
  },
  {
    id: 'caching',
    category: '6. Detailed Component Design',
    title: 'Caching Strategy',
    description: 'Describe where caching is used (CDN, Redis/Memcached) and the eviction policies.',
    placeholder: 'Use CDN for static assets.\nUse Redis for hot data. LRU policy...',
  },
];