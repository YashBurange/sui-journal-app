// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/// This example demonstrates a journal application using owned objects.
/// Rules:
/// - anyone can create a journal
/// - only the owner can add entries to their journal
/// - entries are stored as a vector within the journal object
module journal::journal {
  use std::string::String;
  use std::vector;
  use sui::object;
  use sui::transfer;
  use sui::tx_context::TxContext;

  /// A journal entry containing content and timestamp
  public struct Entry has store {
    content: String,
    create_at_ms: u64,
  }

  /// A journal owned by a user
  public struct Journal has key, store {
    id: object::UID,
    owner: address,
    title: String,
    entries: vector<Entry>,
  }

  /// Create a new journal with the given title
  public fun new_journal(title: String, ctx: &mut TxContext): Journal {
    Journal {
      id: object::new(ctx),
      owner: tx_context::sender(ctx),
      title,
      entries: vector::empty(),
    }
  }

  /// Add a new entry to the journal (only callable by owner)
  public fun add_entry(journal: &mut Journal, content: String, ctx: &TxContext) {
    assert!(journal.owner == tx_context::sender(ctx), 0);
    
    let entry = Entry {
      content,
      create_at_ms: 0, // Use 0 for now, or tx_context::epoch(ctx) for epoch timestamp
    };
    
    vector::push_back(&mut journal.entries, entry);
  }
}