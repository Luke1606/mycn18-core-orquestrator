# Contributing to MyCn18 Core Orchestrator

We welcome contributions to the MyCn18 Orchestrator project! By participating, you agree to abide by our Code of Conduct.

## How to Contribute

1. **Fork the Repository**: Start by forking the `mycn18-core-orchestrator` repository to your GitHub account.
2. **Clone Your Fork**: Clone your forked repository to your local machine.

    ```bash
    git clone https://github.com/YOUR_USERNAME/mycn18-core-orchestrator.git
    cd mycn18-core-orchestrator
    ```

3. **Create a New Branch**: Create a new branch for your feature or bug fix.

    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b bugfix/issue-description
    ```

4. **Install Dependencies**:

    ```bash
    npm ci
    ```

5. **Make Your Changes**: Implement your feature or fix the bug. Ensure your code adheres to the project's coding standards (linting, formatting).
6. **Run Tests**: Before submitting, ensure all existing tests pass and add new tests for your changes.

    ```bash
    npm test
    ```

7. **Lint and Typecheck**:

    ```bash
    npm run lint
    npm run typecheck
    ```

8. **Commit Your Changes**: Write clear and concise commit messages.

    ```bash
    git commit -m "feat: Add new feature"
    # or
    git commit -m "fix: Resolve issue #123"
    ```

9. **Push to Your Fork**:

    ```bash
    git push origin feature/your-feature-name
    ```

10. **Create a Pull Request**: Open a Pull Request from your fork to the `main` branch of the original repository. Fill out the provided Pull Request Template.

## Code Style and Guidelines

- **TypeScript**: All new code should be written in TypeScript.
- **ESLint & Prettier**: We use ESLint for linting and Prettier for code formatting. Ensure your code passes linting and formatting checks.
- **Testing**: All new features and bug fixes should be accompanied by appropriate unit and/or integration tests.

## Reporting Bugs

If you find a bug, please open an issue using the "Bug Report" template.

## Suggesting Features

If you have an idea for a new feature, please open an issue using the "Feature Request" template.

## Code of Conduct

Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.
