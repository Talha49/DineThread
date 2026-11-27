# DineThread experimental records

The five directories hold the synthetic component experiments. The integration directory holds the merged-build observations and the later release checks. Each study's results or protocol identifies its build and workload. Compressed JSON, JSONL and text files use gzip. SHA256SUMS covers the collected source files without changing their bytes.

| Directory | Evidence |
|---|---|
| [Order recovery](order-recovery/) | November 23 API and browser comparison, CSV, logs and receipts |
| [Catalogue](catalogue/) | Matched rounds, fixture checks, price-confirmation screenshots |
| [Theme preview](theme/) | Correctness, delivery timing and React profiling |
| [Accessibility](accessibility/) | Keyboard runs, automated scans, native screen-reader and zoom checks |
| [Kitchen workflow](workflow/) | History checker, browser observations and read-back-to-screen timings |
| [Integration and release](integration/) | Cross-strand checks, screenshots and native speech observations |

The original implementation commits are [catalogue](https://github.com/Talha49/DineThread/commit/3611db71be54230b8e0892fc756e051331078085), [theme preview](https://github.com/Talha49/DineThread/commit/69149a5079a2e01b95a424c3bd914b4005821353) and [kitchen workflow](https://github.com/Talha49/DineThread/commit/5d4422f57a9b4bdab2c662bc80ac9233453a605e). This branch preserves their original history. The group's application is on main. Earlier protocols in this archive describe the experiments as recorded. Current release protocols are maintained in the application repository.
