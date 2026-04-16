# StreamX RAG Chatbot Template

This repository is a **StreamX-based demo template** showcasing integration of **StreamX with a RAG (Retrieval-Augmented Generation) chatbot**.

The project contains:

* A **minimal homepage**
* A **product-aware chatbot (RAG)**

---

# Overview

This template demonstrates:

* StreamX **event-driven ingestion pipeline**
* **RAG pipeline integration**
* Chat-based interface for querying product data

There is no product listing, search, or category browsing — all interaction happens through the chatbot.

---

# Data Ingestion

To quickly load sample or prepared data into the system, you can use the StreamX CLI.

## Using StreamX CLI

### 1. Install StreamX CLI

```bash
brew install streamx-com/tap/streamx
```

### 2. Configure ingestion endpoint

1. Go to **Gateways** in the StreamX Console
2. Copy the **REST Ingestion URL**
3. Configure CLI:

```bash
streamx settings set streamx.ingestion.url <INGESTION_URL>
```

### 3. Configure authentication

1. Go to **Sources** in the StreamX Console
2. Copy the **CLI token**
3. Configure CLI:

```bash
streamx settings set streamx.ingestion.auth-token <TOKEN>
```

### 4. Publish data

```bash
sh scripts/publish-all.sh
```

### 5. Open application

1. Go to **Gateways** in the StreamX Console
2. Open the URL for:

```
web-server-sink
```

---

# RAG Chatbot Configuration

This project is centered around a **StreamX-powered RAG chatbot**.

## System Prompt Customization

To customize chatbot behavior, you must fork this repository and modify:

```
mesh/configs/open-ai-rag.properties
```

Set:

```
streamx.hub.openai-rag-sink.chat-profile.system-prompt
```

This controls how the chatbot:

* interprets product data
* answers user questions
* behaves in domain-specific scenarios

---

# Example Product Stream

Sample data is available in:

```
catalog/products.stream
```

The `content` field contains **Base64-encoded JSON** with product information.

You can decode it to inspect the structure and adapt it to your own data model.

---

# How to Customize This Template

1. Fork the repository
2. Replace sample product stream with your own data
3. Adjust system prompt for your use case
4. Extend UI if needed (homepage + chat only)

---

# Result

You get a minimal but functional **RAG-powered product chatbot demo**, showing how StreamX can connect:

* external data sources
* real-time ingestion pipeline
* AI-driven conversational interface

without any traditional e-commerce frontend layer.
