#!/bin/bash
# test-engine.sh — Run Initra Engine Unit Tests

echo "Running Initra Engine Tests..."
npx vitest run src/lib/engine/__tests__
